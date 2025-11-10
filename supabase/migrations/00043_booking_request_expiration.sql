-- Migration: Automatic Booking Request Expiration
-- Created: 2025-11-10
-- Purpose: Auto-expire booking requests after 24 hours with notifications

-- ============================================================================
-- Function to expire old booking requests
-- ============================================================================

CREATE OR REPLACE FUNCTION public.expire_old_booking_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_request RECORD;
  v_notification_id uuid;
BEGIN
  -- Find all pending requests that have expired
  FOR v_request IN
    SELECT
      br.id,
      br.ride_id,
      br.rider_id,
      r.driver_id,
      u_rider.first_name as rider_first_name,
      u_rider.last_name as rider_last_name,
      r.origin_address,
      r.destination_address
    FROM public.booking_requests br
    JOIN public.rides r ON r.id = br.ride_id
    JOIN public.users u_rider ON u_rider.id = br.rider_id
    WHERE br.status = 'pending'
      AND br.expired = false
      AND br.expires_at <= now()
  LOOP
    -- Mark as expired
    UPDATE public.booking_requests
    SET
      expired = true,
      status = 'declined',
      updated_at = now()
    WHERE id = v_request.id;

    -- Notify rider that their request expired
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      subject,
      body,
      ride_id,
      booking_request_id,
      metadata,
      created_at
    ) VALUES (
      v_request.rider_id,
      'booking_expired',
      'Ride Request Expired',
      'Your ride request expired',
      'Your request to join the ride from ' || v_request.origin_address || ' to ' || v_request.destination_address || ' expired after 24 hours without a response.',
      v_request.ride_id,
      v_request.id,
      jsonb_build_object(
        'expired_at', now(),
        'reason', 'no_driver_response'
      ),
      now()
    );

    -- Notify driver that a request expired
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      subject,
      body,
      ride_id,
      booking_request_id,
      metadata,
      created_at
    ) VALUES (
      v_request.driver_id,
      'booking_expired',
      'Ride Request Expired',
      'A ride request expired',
      'A ride request from ' || v_request.rider_first_name || ' ' || v_request.rider_last_name || ' for your ride expired after 24 hours without your response.',
      v_request.ride_id,
      v_request.id,
      jsonb_build_object(
        'expired_at', now(),
        'reason', 'no_driver_response'
      ),
      now()
    );
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.expire_old_booking_requests() IS 'Expires booking requests older than 24 hours and notifies both parties';

-- ============================================================================
-- Scheduled job would be set up via pg_cron or external cron
-- For now, this can be called manually or via API route
-- ============================================================================

-- Example: SELECT expire_old_booking_requests();
