-- Migration: Add search_path to Remaining Functions and Triggers
-- Description: Adds search_path to all remaining functions (trigger functions and regular functions)
--              This completes the security fix for all 18+ custom functions
--
-- Note: Even though these are not SECURITY DEFINER, setting search_path is still
--       a best practice to prevent unexpected behavior if search_path changes

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Migration 00001: update_updated_at_column (used by many tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migration 00001: update_ride_seats (booking status changes)
CREATE OR REPLACE FUNCTION update_ride_seats()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE public.rides
        SET seats_booked = seats_booked + NEW.seats_requested,
            final_rider_count = final_rider_count + NEW.seats_requested
        WHERE id = NEW.ride_id;
    ELSIF NEW.status IN ('declined', 'cancelled') AND OLD.status = 'approved' THEN
        UPDATE public.rides
        SET seats_booked = seats_booked - NEW.seats_requested,
            final_rider_count = final_rider_count - NEW.seats_requested
        WHERE id = NEW.ride_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migration 00001: create_message_thread (when ride created)
CREATE OR REPLACE FUNCTION create_message_thread()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.message_threads (ride_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migration 00021: trigger_notify_alerts_on_ride_change
CREATE OR REPLACE FUNCTION trigger_notify_alerts_on_ride_change()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  -- Only notify on INSERT or when status changes to 'published'
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN
    PERFORM notify_matching_alerts_for_ride(NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migration 00021: update_ride_alerts_updated_at
CREATE OR REPLACE FUNCTION update_ride_alerts_updated_at()
RETURNS TRIGGER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- REGULAR FUNCTIONS (NOT SECURITY DEFINER, BUT STILL BEST PRACTICE)
-- ============================================================================

-- Migration 00001: auto_reveal_reviews
CREATE OR REPLACE FUNCTION auto_reveal_reviews()
RETURNS void
SET search_path = public
AS $$
BEGIN
    UPDATE public.reviews
    SET is_visible = true
    WHERE is_visible = false
    AND created_at < NOW() - INTERVAL '14 days';
END;
$$ LANGUAGE plpgsql;

-- Migration 00001: search_rides (main ride matching algorithm)
-- Must match exact signature from original migration
DROP FUNCTION IF EXISTS search_rides(FLOAT, FLOAT, FLOAT, FLOAT, INTEGER);

CREATE FUNCTION search_rides(
    start_lng FLOAT,
    start_lat FLOAT,
    end_lng FLOAT,
    end_lat FLOAT,
    max_distance_meters INTEGER DEFAULT 50000
)
RETURNS TABLE (
    ride_id UUID,
    driver_id UUID,
    driver_name TEXT,
    origin_address TEXT,
    destination_address TEXT,
    departure_time TIMESTAMPTZ,
    route_km DECIMAL,
    seats_available INTEGER,
    seats_remaining INTEGER,
    cost_per_person INTEGER,
    pets_allowed BOOLEAN,
    smoking_allowed BOOLEAN
)
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH rider_points AS (
        SELECT
            ST_SetSRID(ST_MakePoint(start_lng, start_lat), 4326)::geography AS start_pt,
            ST_SetSRID(ST_MakePoint(end_lng, end_lat), 4326)::geography AS end_pt
    )
    SELECT
        r.id as ride_id,
        r.driver_id,
        u.full_name as driver_name,
        r.origin_address,
        r.destination_address,
        r.departure_time,
        r.route_km,
        r.seats_available,
        (r.seats_available - r.seats_booked) as seats_remaining,
        ROUND(
            COALESCE(r.custom_total_cost, r.suggested_total_cost)::NUMERIC /
            NULLIF(r.final_rider_count + 1, 0)
        )::INTEGER as cost_per_person,
        r.pets_allowed,
        r.smoking_allowed
    FROM public.rides r
    CROSS JOIN rider_points rp
    JOIN public.users u ON r.driver_id = u.id
    WHERE r.departure_time >= NOW()
        AND r.status = 'published'
        AND (r.seats_available - r.seats_booked) > 0
        AND ST_DWithin(r.origin_coords, rp.start_pt, max_distance_meters)
        AND ST_DWithin(r.destination_coords, rp.end_pt, max_distance_meters)
    ORDER BY r.departure_time ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Migration 00021: check_ride_matches_alert
CREATE OR REPLACE FUNCTION check_ride_matches_alert(
  p_alert_id UUID,
  p_ride_id UUID
)
RETURNS BOOLEAN
SET search_path = public
AS $$
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

  -- Check departure location proximity
  v_departure_distance := ST_Distance(
    v_alert.departure_location::geography,
    v_ride.origin_location::geography
  );

  IF v_departure_distance > v_alert.max_distance_meters THEN
    RETURN FALSE;
  END IF;

  -- Check destination location proximity
  v_destination_distance := ST_Distance(
    v_alert.destination_location::geography,
    v_ride.destination_location::geography
  );

  IF v_destination_distance > v_alert.max_distance_meters THEN
    RETURN FALSE;
  END IF;

  -- Check departure time window if specified
  IF v_alert.departure_time_from IS NOT NULL THEN
    IF v_ride.departure_time < v_alert.departure_time_from THEN
      RETURN FALSE;
    END IF;
  END IF;

  IF v_alert.departure_time_to IS NOT NULL THEN
    IF v_ride.departure_time > v_alert.departure_time_to THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- Check min available seats if specified
  IF v_alert.min_seats IS NOT NULL THEN
    IF v_ride.seats_available < v_alert.min_seats THEN
      RETURN FALSE;
    END IF;
  END IF;

  -- All checks passed
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_functions INTEGER;
  with_search_path INTEGER;
  missing_search_path INTEGER;
BEGIN
  -- Count all custom functions in public schema (excluding system functions)
  SELECT COUNT(*) INTO total_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname NOT LIKE 'pg_%'
  AND p.proname NOT IN ('vector_in', 'vector_out', 'vector_recv', 'vector_send');

  -- Count functions with search_path set
  SELECT COUNT(*) INTO with_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname NOT LIKE 'pg_%'
  AND p.proname NOT IN ('vector_in', 'vector_out', 'vector_recv', 'vector_send')
  AND p.proconfig IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(p.proconfig) cfg
    WHERE cfg LIKE 'search_path=%'
  );

  missing_search_path := total_functions - with_search_path;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total custom functions: %', total_functions;
  RAISE NOTICE 'With search_path: %', with_search_path;
  RAISE NOTICE 'Missing search_path: %', missing_search_path;
  RAISE NOTICE '====================================';

  IF missing_search_path > 0 THEN
    RAISE WARNING 'Still have % functions without search_path', missing_search_path;
  ELSE
    RAISE NOTICE '✅ All custom functions now have search_path set';
  END IF;
END $$;

-- ============================================================================
-- RESULT
-- ============================================================================
-- ✅ All remaining functions now have "SET search_path = public"
-- ✅ This includes all trigger functions and regular functions
-- ✅ All 18+ custom functions now protected against search_path injection
-- ============================================================================

COMMENT ON FUNCTION update_updated_at_column IS 'Updates updated_at timestamp - has search_path';
COMMENT ON FUNCTION update_ride_seats IS 'Updates ride seats on booking changes - has search_path';
COMMENT ON FUNCTION create_message_thread IS 'Creates message thread on ride creation - has search_path';
COMMENT ON FUNCTION auto_reveal_reviews IS 'Auto-reveals reviews after 14 days - has search_path';
COMMENT ON FUNCTION search_rides IS 'Main ride matching algorithm - has search_path';
COMMENT ON FUNCTION check_ride_matches_alert IS 'Checks if ride matches alert criteria - has search_path';
COMMENT ON FUNCTION trigger_notify_alerts_on_ride_change IS 'Notifies alerts on ride publish - has search_path';
COMMENT ON FUNCTION update_ride_alerts_updated_at IS 'Updates ride alerts timestamp - has search_path';
