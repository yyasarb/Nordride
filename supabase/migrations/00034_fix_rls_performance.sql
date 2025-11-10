-- Migration: Fix RLS Performance Issues
-- Created: 2025-11-10
-- Purpose: Wrap auth.uid() in subqueries to prevent re-evaluation per row
-- Status: Performance optimization
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- ============================================================================
-- USERS TABLE
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================================
-- VEHICLES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage own vehicles" ON public.vehicles;

CREATE POLICY "Users can manage own vehicles"
  ON public.vehicles
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- RIDES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Drivers can manage own rides" ON public.rides;

CREATE POLICY "Drivers can manage own rides"
  ON public.rides
  FOR ALL
  TO authenticated
  USING (driver_id = (SELECT auth.uid()))
  WITH CHECK (driver_id = (SELECT auth.uid()));

-- ============================================================================
-- BOOKING_REQUESTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own bookings" ON public.booking_requests;
DROP POLICY IF EXISTS "Riders can create bookings" ON public.booking_requests;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.booking_requests;

CREATE POLICY "Users can view own bookings"
  ON public.booking_requests
  FOR SELECT
  TO authenticated
  USING (
    rider_id = (SELECT auth.uid()) OR
    ride_id IN (
      SELECT id FROM public.rides WHERE driver_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Riders can create bookings"
  ON public.booking_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (rider_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own bookings"
  ON public.booking_requests
  FOR UPDATE
  TO authenticated
  USING (
    rider_id = (SELECT auth.uid()) OR
    ride_id IN (
      SELECT id FROM public.rides WHERE driver_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can create reviews for completed rides" ON public.reviews;

CREATE POLICY "Users can create reviews for completed rides"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reviewer_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.id = ride_id
      AND r.completed = true
      AND (
        r.driver_id = (SELECT auth.uid()) OR
        EXISTS (
          SELECT 1 FROM public.booking_requests br
          WHERE br.ride_id = r.id
          AND br.rider_id = (SELECT auth.uid())
          AND br.status = 'approved'
        )
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- MESSAGE_THREADS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Drivers can create message threads for their rides" ON public.message_threads;
DROP POLICY IF EXISTS "Users can view message threads for their rides" ON public.message_threads;
DROP POLICY IF EXISTS "Users can update message threads for their rides" ON public.message_threads;
DROP POLICY IF EXISTS "Users can view their message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Drivers can create message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Drivers can soft-delete message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Riders can soft-delete message threads" ON public.message_threads;

CREATE POLICY "Drivers can create message threads"
  ON public.message_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ride_id IN (
      SELECT id FROM public.rides WHERE driver_id = (SELECT auth.uid())
    ) OR
    user1_id = (SELECT auth.uid()) OR
    user2_id = (SELECT auth.uid())
  );

CREATE POLICY "Users can view their message threads"
  ON public.message_threads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.id = message_threads.ride_id
      AND r.driver_id = (SELECT auth.uid())
      AND message_threads.driver_deleted_at IS NULL
    ) OR
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      JOIN public.rides r ON r.id = br.ride_id
      WHERE br.ride_id = message_threads.ride_id
      AND br.rider_id = (SELECT auth.uid())
      AND message_threads.rider_deleted_at IS NULL
    ) OR
    (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid()))
  );

CREATE POLICY "Users can update message threads"
  ON public.message_threads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.id = message_threads.ride_id
      AND r.driver_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.ride_id = message_threads.ride_id
      AND br.rider_id = (SELECT auth.uid())
    ) OR
    user1_id = (SELECT auth.uid()) OR
    user2_id = (SELECT auth.uid())
  );

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages for their rides" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON public.messages;

CREATE POLICY "Users can view messages for their rides"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      JOIN public.rides r ON r.id = mt.ride_id
      WHERE mt.id = messages.thread_id
      AND r.driver_id = (SELECT auth.uid())
      AND mt.driver_deleted_at IS NULL
    ) OR
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      JOIN public.booking_requests br ON br.ride_id = mt.ride_id
      WHERE mt.id = messages.thread_id
      AND br.rider_id = (SELECT auth.uid())
      AND mt.rider_deleted_at IS NULL
    ) OR
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.user1_id = (SELECT auth.uid()) OR mt.user2_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can send messages in their threads"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid()) AND
    (
      EXISTS (
        SELECT 1 FROM public.message_threads mt
        JOIN public.rides r ON r.id = mt.ride_id
        WHERE mt.id = messages.thread_id
        AND r.driver_id = (SELECT auth.uid())
      ) OR
      EXISTS (
        SELECT 1 FROM public.message_threads mt
        JOIN public.booking_requests br ON br.ride_id = mt.ride_id
        WHERE mt.id = messages.thread_id
        AND br.rider_id = (SELECT auth.uid())
        AND br.status IN ('pending', 'approved')
      ) OR
      EXISTS (
        SELECT 1 FROM public.message_threads mt
        WHERE mt.id = messages.thread_id
        AND (mt.user1_id = (SELECT auth.uid()) OR mt.user2_id = (SELECT auth.uid()))
      )
    )
  );

CREATE POLICY "Users can update messages in their threads"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      JOIN public.rides r ON r.id = mt.ride_id
      WHERE mt.id = messages.thread_id
      AND r.driver_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      JOIN public.booking_requests br ON br.ride_id = mt.ride_id
      WHERE mt.id = messages.thread_id
      AND br.rider_id = (SELECT auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.user1_id = (SELECT auth.uid()) OR mt.user2_id = (SELECT auth.uid()))
    )
  );

-- ============================================================================
-- RIDE_ALERTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own alerts" ON public.ride_alerts;
DROP POLICY IF EXISTS "Users can create their own alerts" ON public.ride_alerts;
DROP POLICY IF EXISTS "Users can update their own alerts" ON public.ride_alerts;
DROP POLICY IF EXISTS "Users can delete their own alerts" ON public.ride_alerts;

CREATE POLICY "Users can view their own alerts"
  ON public.ride_alerts
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own alerts"
  ON public.ride_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own alerts"
  ON public.ride_alerts
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own alerts"
  ON public.ride_alerts
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- ALERT_NOTIFICATIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own alert notifications" ON public.alert_notifications;

CREATE POLICY "Users can view their own alert notifications"
  ON public.alert_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ride_alerts ra
      WHERE ra.id = alert_notifications.alert_id
      AND ra.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update their own pending reports" ON public.reports;

CREATE POLICY "Users can create reports"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own reports"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own pending reports"
  ON public.reports
  FOR UPDATE
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()) AND status = 'pending')
  WITH CHECK (reporter_id = (SELECT auth.uid()));

-- ============================================================================
-- TRIP_COMPLETIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view completions for their rides" ON public.trip_completions;
DROP POLICY IF EXISTS "Users can mark trips complete" ON public.trip_completions;

CREATE POLICY "Users can view completions for their rides"
  ON public.trip_completions
  FOR SELECT
  TO authenticated
  USING (
    rider_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.id = trip_completions.ride_id
      AND r.driver_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can mark trips complete"
  ON public.trip_completions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    rider_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.rides r
      WHERE r.id = trip_completions.ride_id
      AND r.driver_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- ADMIN_AUDIT_LOG TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.admin_audit_log;

CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    admin_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = (SELECT auth.uid())
      AND is_admin = true
    )
  );

-- ============================================================================
-- FRIENDSHIPS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their own friendship requests" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.friendships;

CREATE POLICY "Users can view their own friendships"
  ON public.friendships
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR friend_id = (SELECT auth.uid()));

CREATE POLICY "Users can create friend requests"
  ON public.friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own friendship requests"
  ON public.friendships
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR friend_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()) OR friend_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own friendships"
  ON public.friendships
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR friend_id = (SELECT auth.uid()));

-- ============================================================================
-- BLOCKED_USERS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can create blocks" ON public.blocked_users;
DROP POLICY IF EXISTS "Users can delete their own blocks" ON public.blocked_users;

CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users
  FOR SELECT
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

CREATE POLICY "Users can create blocks"
  ON public.blocked_users
  FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own blocks"
  ON public.blocked_users
  FOR DELETE
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

-- Add comment to track completion
COMMENT ON TABLE public.users IS 'Users table - RLS policies optimized with subquery auth.uid() on 2025-11-10';
