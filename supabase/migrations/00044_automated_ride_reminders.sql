-- Migration: Automated Ride Reminders
-- Created: 2025-11-10
-- Purpose: Send automated reminders to drivers and riders before trips

-- ============================================================================
-- Function to send ride reminders
-- ============================================================================

CREATE OR REPLACE FUNCTION public.send_ride_reminders(p_hours_before integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_ride RECORD;
  v_rider RECORD;
  v_reminders_sent integer := 0;
  v_time_window_start timestamptz;
  v_time_window_end timestamptz;
  v_reminder_type text;
BEGIN
  -- Calculate time window for rides
  v_time_window_start := now() + (p_hours_before || ' hours')::interval - interval '30 minutes';
  v_time_window_end := now() + (p_hours_before || ' hours')::interval + interval '30 minutes';

  -- Determine reminder type
  v_reminder_type := CASE
    WHEN p_hours_before = 24 THEN 'reminder_24h'
    WHEN p_hours_before = 12 THEN 'reminder_12h'
    WHEN p_hours_before = 1 THEN 'reminder_1h'
    ELSE 'reminder_custom'
  END;

  -- Find upcoming rides in the time window
  FOR v_ride IN
    SELECT
      r.id,
      r.driver_id,
      r.origin_address,
      r.destination_address,
      r.departure_time,
      r.seats_booked,
      u_driver.first_name as driver_first_name,
      u_driver.last_name as driver_last_name,
      u_driver.email as driver_email
    FROM public.rides r
    JOIN public.users u_driver ON u_driver.id = r.driver_id
    WHERE r.status IN ('published', 'confirmed')
      AND r.departure_time BETWEEN v_time_window_start AND v_time_window_end
      AND NOT EXISTS (
        -- Don't send duplicate reminders
        SELECT 1 FROM public.notifications n
        WHERE n.ride_id = r.id
          AND n.type = v_reminder_type
          AND n.created_at > now() - interval '2 hours'
      )
  LOOP
    -- Send reminder to driver
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      subject,
      body,
      ride_id,
      metadata,
      created_at
    ) VALUES (
      v_ride.driver_id,
      v_reminder_type,
      CASE
        WHEN p_hours_before = 24 THEN 'Your ride is tomorrow'
        WHEN p_hours_before = 12 THEN 'Your ride is in 12 hours'
        WHEN p_hours_before = 1 THEN 'Your ride starts in 1 hour'
        ELSE 'Ride reminder'
      END,
      'Upcoming ride reminder',
      'Reminder: Your ride from ' || v_ride.origin_address || ' to ' || v_ride.destination_address || ' departs at ' || to_char(v_ride.departure_time, 'HH24:MI on Mon DD, YYYY') || '. You have ' || v_ride.seats_booked || ' passenger(s) booked.',
      v_ride.id,
      jsonb_build_object(
        'hours_before', p_hours_before,
        'departure_time', v_ride.departure_time,
        'role', 'driver',
        'passengers_count', v_ride.seats_booked
      ),
      now()
    );

    v_reminders_sent := v_reminders_sent + 1;

    -- Send reminder to each approved rider
    FOR v_rider IN
      SELECT
        br.rider_id,
        br.pickup_address,
        br.dropoff_address,
        u_rider.first_name,
        u_rider.last_name,
        u_rider.email
      FROM public.booking_requests br
      JOIN public.users u_rider ON u_rider.id = br.rider_id
      WHERE br.ride_id = v_ride.id
        AND br.status = 'approved'
    LOOP
      INSERT INTO public.notifications (
        user_id,
        type,
        title,
        subject,
        body,
        ride_id,
        metadata,
        created_at
      ) VALUES (
        v_rider.rider_id,
        v_reminder_type,
        CASE
          WHEN p_hours_before = 24 THEN 'Your ride is tomorrow'
          WHEN p_hours_before = 12 THEN 'Your ride is in 12 hours'
          WHEN p_hours_before = 1 THEN 'Your ride starts in 1 hour'
          ELSE 'Ride reminder'
        END,
        'Upcoming ride reminder',
        'Reminder: Your ride with ' || v_ride.driver_first_name || ' ' || v_ride.driver_last_name || ' from ' || v_ride.origin_address || ' to ' || v_ride.destination_address || ' departs at ' || to_char(v_ride.departure_time, 'HH24:MI on Mon DD, YYYY') || '. Be ready on time!',
        v_ride.id,
        jsonb_build_object(
          'hours_before', p_hours_before,
          'departure_time', v_ride.departure_time,
          'role', 'rider',
          'driver_name', v_ride.driver_first_name || ' ' || v_ride.driver_last_name,
          'pickup_address', v_rider.pickup_address
        ),
        now()
      );

      v_reminders_sent := v_reminders_sent + 1;
    END LOOP;
  END LOOP;

  RETURN v_reminders_sent;
END;
$$;

COMMENT ON FUNCTION public.send_ride_reminders(integer) IS 'Sends reminders for rides departing in X hours. Returns count of reminders sent.';

-- ============================================================================
-- Examples of how to call this function (via cron or API):
-- SELECT send_ride_reminders(24);  -- 24 hours before
-- SELECT send_ride_reminders(12);  -- 12 hours before
-- SELECT send_ride_reminders(1);   -- 1 hour before
-- ============================================================================
