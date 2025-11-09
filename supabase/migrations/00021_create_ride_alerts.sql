-- Migration: Ride Alerts System
-- Description: Creates ride_alerts table for users to save route alerts
--              Triggers notifications when new rides match alert criteria

-- ============================================================================
-- STEP 1: Create ride_alerts table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ride_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT, -- Optional friendly name for the alert
  departure_address TEXT NOT NULL,
  departure_coords GEOGRAPHY(POINT, 4326) NOT NULL,
  destination_address TEXT NOT NULL,
  destination_coords GEOGRAPHY(POINT, 4326) NOT NULL,
  proximity_km INTEGER NOT NULL DEFAULT 20,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.ride_alerts IS 'Saved route alerts for users to be notified of matching rides';
COMMENT ON COLUMN public.ride_alerts.name IS 'Optional user-friendly name for the alert';
COMMENT ON COLUMN public.ride_alerts.departure_coords IS 'PostGIS point for departure location';
COMMENT ON COLUMN public.ride_alerts.destination_coords IS 'PostGIS point for destination location';
COMMENT ON COLUMN public.ride_alerts.proximity_km IS 'Maximum distance (km) from route for matching (1-50)';
COMMENT ON COLUMN public.ride_alerts.is_enabled IS 'Whether alert is active and will send notifications';

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_ride_alerts_user_id ON public.ride_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_alerts_enabled ON public.ride_alerts(user_id, is_enabled) WHERE is_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_ride_alerts_departure_coords ON public.ride_alerts USING GIST(departure_coords);
CREATE INDEX IF NOT EXISTS idx_ride_alerts_destination_coords ON public.ride_alerts USING GIST(destination_coords);

-- ============================================================================
-- STEP 3: Create RLS policies
-- ============================================================================

ALTER TABLE public.ride_alerts ENABLE ROW LEVEL SECURITY;

-- Users can view their own alerts
CREATE POLICY "Users can view their own alerts"
ON public.ride_alerts
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own alerts (max 10 active)
CREATE POLICY "Users can create their own alerts"
ON public.ride_alerts
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  (SELECT COUNT(*) FROM public.ride_alerts WHERE user_id = auth.uid() AND is_enabled = TRUE) < 10
);

-- Users can update their own alerts
CREATE POLICY "Users can update their own alerts"
ON public.ride_alerts
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete their own alerts"
ON public.ride_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Create alert-to-ride matching notification table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.ride_alerts(id) ON DELETE CASCADE,
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(alert_id, ride_id)
);

COMMENT ON TABLE public.alert_notifications IS 'Tracks which alerts have notified for which rides (de-duplication)';

CREATE INDEX IF NOT EXISTS idx_alert_notifications_alert_id ON public.alert_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_ride_id ON public.alert_notifications(ride_id);

ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- System can insert alert notifications (via function)
CREATE POLICY "System can insert alert notifications"
ON public.alert_notifications
FOR INSERT
WITH CHECK (true);

-- Users can view their own alert notifications
CREATE POLICY "Users can view their own alert notifications"
ON public.alert_notifications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ride_alerts
    WHERE ride_alerts.id = alert_id
    AND ride_alerts.user_id = auth.uid()
  )
);

-- ============================================================================
-- STEP 5: Create function to check if ride matches alert
-- ============================================================================

CREATE OR REPLACE FUNCTION check_ride_matches_alert(
  p_alert_id UUID,
  p_ride_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_alert RECORD;
  v_ride RECORD;
  v_departure_distance NUMERIC;
  v_destination_distance NUMERIC;
  v_route_polyline TEXT;
BEGIN
  -- Get alert details
  SELECT * INTO v_alert FROM public.ride_alerts WHERE id = p_alert_id;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get ride details
  SELECT * INTO v_ride FROM public.rides WHERE id = p_ride_id;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Don't match user's own rides
  IF v_alert.user_id = v_ride.driver_id THEN
    RETURN FALSE;
  END IF;

  -- Check if both departure and destination are within proximity to the ride's route
  -- Use ST_Distance for geography types (returns meters)
  v_departure_distance := ST_Distance(
    v_alert.departure_coords,
    v_ride.route_polyline::geography
  ) / 1000; -- Convert to km

  v_destination_distance := ST_Distance(
    v_alert.destination_coords,
    v_ride.route_polyline::geography
  ) / 1000; -- Convert to km

  -- Both points must be within the proximity threshold
  IF v_departure_distance <= v_alert.proximity_km AND v_destination_distance <= v_alert.proximity_km THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_ride_matches_alert IS 'Checks if a ride matches an alert criteria (both points within proximity)';

-- ============================================================================
-- STEP 6: Create function to notify matching alerts for a new ride
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_matching_alerts_for_ride(p_ride_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_ride RECORD;
  v_alert RECORD;
  v_notification_id UUID;
  v_count INTEGER := 0;
  v_already_notified BOOLEAN;
BEGIN
  -- Get ride details
  SELECT * INTO v_ride FROM public.rides WHERE id = p_ride_id;
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Only process published rides
  IF v_ride.status != 'published' THEN
    RETURN 0;
  END IF;

  -- Loop through all enabled alerts
  FOR v_alert IN
    SELECT * FROM public.ride_alerts
    WHERE is_enabled = TRUE
    AND user_id != v_ride.driver_id -- Don't notify driver of their own ride
  LOOP
    -- Check if already notified for this alert-ride pair
    SELECT EXISTS(
      SELECT 1 FROM public.alert_notifications
      WHERE alert_id = v_alert.id AND ride_id = p_ride_id
    ) INTO v_already_notified;

    IF v_already_notified THEN
      CONTINUE; -- Skip if already notified
    END IF;

    -- Check if ride matches alert
    IF check_ride_matches_alert(v_alert.id, p_ride_id) THEN
      -- Create notification
      v_notification_id := create_notification(
        p_user_id := v_alert.user_id,
        p_type := 'ride_alert_match',
        p_title := 'New ride matches your alert',
        p_body := 'A new ride from ' || v_ride.origin_address || ' to ' || v_ride.destination_address || ' matches your saved route alert.',
        p_ride_id := p_ride_id,
        p_metadata := jsonb_build_object(
          'alert_id', v_alert.id,
          'alert_name', COALESCE(v_alert.name, 'Unnamed Alert'),
          'departure_address', v_ride.origin_address,
          'destination_address', v_ride.destination_address,
          'departure_time', v_ride.departure_time
        )
      );

      -- Record that we've notified for this alert-ride pair
      INSERT INTO public.alert_notifications (alert_id, ride_id, notification_id)
      VALUES (v_alert.id, p_ride_id, v_notification_id);

      v_count := v_count + 1;
    END IF;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION notify_matching_alerts_for_ride IS 'Notifies all users with matching alerts when a new ride is created';

-- ============================================================================
-- STEP 7: Create trigger to check alerts when ride is created/updated
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_notify_alerts_on_ride_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on INSERT or when status changes to 'published'
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN
    PERFORM notify_matching_alerts_for_ride(NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_alerts_on_ride_published
AFTER INSERT OR UPDATE ON public.rides
FOR EACH ROW
EXECUTE FUNCTION trigger_notify_alerts_on_ride_change();

COMMENT ON TRIGGER notify_alerts_on_ride_published ON public.rides IS 'Automatically notify matching alerts when ride is published';

-- ============================================================================
-- STEP 8: Create updated_at trigger for ride_alerts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ride_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ride_alerts_timestamp
BEFORE UPDATE ON public.ride_alerts
FOR EACH ROW
EXECUTE FUNCTION update_ride_alerts_updated_at();

-- ============================================================================
-- STEP 9: Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ride_alerts TO authenticated;
GRANT SELECT ON public.alert_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION check_ride_matches_alert TO authenticated;
GRANT EXECUTE ON FUNCTION notify_matching_alerts_for_ride TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- SUMMARY:
-- ✅ Created ride_alerts table with geography points
-- ✅ Added indexes for user queries and spatial lookups
-- ✅ Implemented RLS policies (max 10 active alerts per user)
-- ✅ Created alert_notifications table for de-duplication
-- ✅ Implemented matching logic using PostGIS distance calculations
-- ✅ Created automatic notification trigger on ride publish
-- ✅ Added updated_at timestamp trigger
-- ✅ Granted necessary permissions

-- USAGE:
-- 1. User creates alert via INSERT into ride_alerts
-- 2. When driver publishes ride, trigger automatically checks all alerts
-- 3. Matching alerts create notifications via create_notification function
-- 4. alert_notifications prevents duplicate notifications
