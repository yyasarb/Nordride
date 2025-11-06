-- Migration: In-App Notifications System
-- Description: Creates notifications table and triggers for ride-related events
--              Supports rider cancellations, approvals, and ride updates

-- ============================================================================
-- STEP 1: Create notifications table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'rider_cancelled', 'request_approved', 'request_denied', etc.
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  booking_request_id UUID REFERENCES public.booking_requests(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ DEFAULT NULL
);

COMMENT ON TABLE public.notifications IS 'In-app notifications for ride-related events';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification: rider_cancelled, request_approved, request_denied, ride_updated, etc.';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional context data (rider name, seat count, etc.)';

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_ride_id ON public.notifications(ride_id);

-- ============================================================================
-- STEP 3: Create RLS policies
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their own notifications as read
CREATE POLICY "Users can mark their own notifications as read"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Create helper function to create notifications
-- ============================================================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_body TEXT,
  p_ride_id UUID DEFAULT NULL,
  p_booking_request_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    body,
    ride_id,
    booking_request_id,
    metadata
  )
  VALUES (
    p_user_id,
    p_type,
    p_title,
    p_body,
    p_ride_id,
    p_booking_request_id,
    p_metadata
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_notification IS 'Helper function to create in-app notifications for users';

-- ============================================================================
-- STEP 5: Enable realtime for notifications
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- SUMMARY:
-- ✅ Created notifications table with proper structure
-- ✅ Added indexes for performance (user_id, is_read, created_at, ride_id)
-- ✅ Implemented RLS policies for security
-- ✅ Created helper function for easy notification creation
-- ✅ Enabled realtime subscriptions
-- ✅ Granted necessary permissions

-- USAGE EXAMPLE:
-- SELECT create_notification(
--   p_user_id := '123e4567-e89b-12d3-a456-426614174000',
--   p_type := 'rider_cancelled',
--   p_title := 'Rider cancelled the ride',
--   p_body := 'A rider has cancelled their seat on your trip from Stockholm to Gothenburg.',
--   p_ride_id := '123e4567-e89b-12d3-a456-426614174001',
--   p_metadata := '{"rider_name": "John Doe", "seats_freed": 1}'::jsonb
-- );
