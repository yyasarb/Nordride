-- Migration: Fix notify_matching_alerts_for_ride function
-- Created: 2025-11-10
-- Purpose: Fix column u.name does not exist error
-- Issue: Function references non-existent u.name column, should use u.first_name and u.last_name

-- Drop and recreate the function with correct column names
CREATE OR REPLACE FUNCTION public.notify_matching_alerts_for_ride(p_ride_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ride RECORD;
  v_alert RECORD;
  v_notification_id UUID;
BEGIN
  -- Get the ride details
  SELECT id, driver_id, origin_address, destination_address,
         COALESCE(origin_address, 'Unknown') as origin_city,
         COALESCE(destination_address, 'Unknown') as destination_city
  INTO v_ride
  FROM public.rides
  WHERE id = p_ride_id;

  -- Only proceed if ride exists and is published
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Check if ride is published
  IF (SELECT status FROM public.rides WHERE id = p_ride_id) != 'published' THEN
    RETURN;
  END IF;

  -- Find all active alerts that match this ride
  FOR v_alert IN
    SELECT ra.*, u.email, u.first_name, u.last_name
    FROM public.ride_alerts ra
    JOIN public.users u ON u.id = ra.user_id
    WHERE ra.is_enabled = true
    AND ra.user_id != v_ride.driver_id  -- Don't notify driver about their own ride
    AND check_ride_matches_alert(ra.id, p_ride_id)
  LOOP
    -- Create notification for this user
    SELECT create_notification(
      v_alert.user_id,
      'ride_alert_match',
      'New Ride Match!',
      'A new ride matching your alert from ' || v_ride.origin_city || ' to ' || v_ride.destination_city || ' is available.',
      p_ride_id,
      NULL,
      jsonb_build_object(
        'alert_id', v_alert.id,
        'alert_name', v_alert.name,
        'ride_id', p_ride_id,
        'origin', v_ride.origin_address,
        'destination', v_ride.destination_address
      )
    ) INTO v_notification_id;

    -- Record that we notified this alert about this ride (prevent duplicates)
    INSERT INTO public.alert_notifications (alert_id, ride_id, notification_id)
    VALUES (v_alert.id, p_ride_id, v_notification_id)
    ON CONFLICT (alert_id, ride_id) DO NOTHING;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.notify_matching_alerts_for_ride(UUID) IS 'Fixed: Changed u.name to u.first_name and u.last_name, and ra.is_active to ra.is_enabled';
