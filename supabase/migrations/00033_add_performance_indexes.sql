-- Migration: Add Performance Indexes for Foreign Keys
-- Created: 2025-11-10
-- Purpose: Fix unindexed foreign keys identified by Supabase advisor
-- Status: Performance optimization

-- Add indexes for foreign keys that are frequently queried

-- booking_requests table
CREATE INDEX IF NOT EXISTS idx_booking_requests_rider_id
  ON public.booking_requests(rider_id);

-- rides table
CREATE INDEX IF NOT EXISTS idx_rides_driver_id
  ON public.rides(driver_id);

CREATE INDEX IF NOT EXISTS idx_rides_vehicle_id
  ON public.rides(vehicle_id);

-- messages table
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON public.messages(sender_id);

-- notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_booking_request_id
  ON public.notifications(booking_request_id);

-- reports table
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id
  ON public.reports(reported_user_id);

CREATE INDEX IF NOT EXISTS idx_reports_reporter_id
  ON public.reports(reporter_id);

CREATE INDEX IF NOT EXISTS idx_reports_ride_id
  ON public.reports(ride_id);

-- reviews table
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id
  ON public.reviews(reviewee_id);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id
  ON public.reviews(reviewer_id);

-- trip_completions table
CREATE INDEX IF NOT EXISTS idx_trip_completions_rider_id
  ON public.trip_completions(rider_id);

-- message_threads table
CREATE INDEX IF NOT EXISTS idx_message_threads_user2_id
  ON public.message_threads(user2_id);

-- alert_notifications table
CREATE INDEX IF NOT EXISTS idx_alert_notifications_notification_id
  ON public.alert_notifications(notification_id);

COMMENT ON INDEX idx_booking_requests_rider_id IS 'Performance: Query bookings by rider';
COMMENT ON INDEX idx_rides_driver_id IS 'Performance: Query rides by driver';
COMMENT ON INDEX idx_rides_vehicle_id IS 'Performance: Query rides by vehicle';
COMMENT ON INDEX idx_messages_sender_id IS 'Performance: Query messages by sender';
COMMENT ON INDEX idx_notifications_booking_request_id IS 'Performance: Query notifications by booking request';
COMMENT ON INDEX idx_reports_reported_user_id IS 'Performance: Query reports by reported user';
COMMENT ON INDEX idx_reports_reporter_id IS 'Performance: Query reports by reporter';
COMMENT ON INDEX idx_reports_ride_id IS 'Performance: Query reports by ride';
COMMENT ON INDEX idx_reviews_reviewee_id IS 'Performance: Query reviews by reviewee';
COMMENT ON INDEX idx_reviews_reviewer_id IS 'Performance: Query reviews by reviewer';
COMMENT ON INDEX idx_trip_completions_rider_id IS 'Performance: Query trip completions by rider';
COMMENT ON INDEX idx_message_threads_user2_id IS 'Performance: Query message threads by user2';
COMMENT ON INDEX idx_alert_notifications_notification_id IS 'Performance: Query alert notifications by notification';
