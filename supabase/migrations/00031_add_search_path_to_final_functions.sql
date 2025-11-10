-- Migration: Add search_path to Final Remaining Functions
-- Description: Adds search_path to the last 8 functions that were created directly in the database
--              This completes the security fix for ALL custom functions
--
-- Note: These functions were not in previous migrations, likely created via Supabase Studio or direct SQL

-- ============================================================================
-- REMAINING SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Function 1: add_rider_to_completed
CREATE OR REPLACE FUNCTION add_rider_to_completed(ride_id uuid, rider_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.rides
  SET riders_marked_complete = array_append(riders_marked_complete, rider_id)
  WHERE id = ride_id
    AND NOT (riders_marked_complete @> ARRAY[rider_id]);
END;
$function$;

-- Function 2: create_system_notification_with_message
CREATE OR REPLACE FUNCTION create_system_notification_with_message(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_body text,
  p_ride_id uuid DEFAULT NULL::uuid,
  p_booking_request_id uuid DEFAULT NULL::uuid,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_send_chat_message boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_notification_id UUID;
  v_thread_id UUID;
  v_driver_id UUID;
  v_other_user_id UUID;
BEGIN
  -- Create the notification (always)
  v_notification_id := create_notification(
    p_user_id := p_user_id,
    p_type := p_type,
    p_title := p_title,
    p_body := p_body,
    p_ride_id := p_ride_id,
    p_booking_request_id := p_booking_request_id,
    p_metadata := p_metadata
  );

  -- If chat message should be sent and ride_id is provided
  IF p_send_chat_message AND p_ride_id IS NOT NULL THEN
    -- Get the thread for this ride
    SELECT id, ride.driver_id INTO v_thread_id, v_driver_id
    FROM public.message_threads
    JOIN public.rides ride ON ride.id = message_threads.ride_id
    WHERE message_threads.ride_id = p_ride_id;

    -- If thread exists, post a system message
    IF v_thread_id IS NOT NULL THEN
      INSERT INTO public.messages (
        thread_id,
        sender_id,
        body,
        is_read,
        system_generated,
        metadata
      )
      VALUES (
        v_thread_id,
        p_user_id,
        p_body,
        true,
        true,
        jsonb_build_object(
          'type', 'system',
          'system_type', p_type,
          'notification_id', v_notification_id,
          'booking_request_id', p_booking_request_id
        ) || p_metadata
      );

      -- Update thread's last_message_at timestamp
      UPDATE public.message_threads
      SET last_message_at = NOW()
      WHERE id = v_thread_id;
    END IF;
  END IF;

  RETURN v_notification_id;
END;
$function$;

-- Function 3: update_ride_seats_on_cancellation
CREATE OR REPLACE FUNCTION update_ride_seats_on_cancellation(
  p_ride_id uuid,
  p_seats_to_free integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Decrement seats_booked and final_rider_count by the number of seats being freed
  UPDATE public.rides
  SET
    seats_booked = GREATEST(0, seats_booked - p_seats_to_free),
    final_rider_count = GREATEST(0, final_rider_count - p_seats_to_free)
  WHERE id = p_ride_id;

  -- Verify the update succeeded
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ride with ID % not found', p_ride_id;
  END IF;
END;
$function$;

-- Function 4: update_user_tier
CREATE OR REPLACE FUNCTION update_user_tier(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_new_tier INTEGER;
  v_old_tier INTEGER;
BEGIN
  -- Calculate new tier
  v_new_tier := calculate_user_tier(p_user_id);

  -- Get current tier
  SELECT current_tier INTO v_old_tier
  FROM public.users
  WHERE id = p_user_id;

  -- Update if changed
  IF v_new_tier != v_old_tier THEN
    UPDATE public.users
    SET current_tier = v_new_tier,
        tier_updated_at = NOW()
    WHERE id = p_user_id;

    -- Create notification if tier increased
    IF v_new_tier > v_old_tier THEN
      PERFORM create_notification(
        p_user_id := p_user_id,
        p_type := 'tier_unlocked',
        p_title := CASE v_new_tier
          WHEN 2 THEN '🎉 Verified Rider Badge Unlocked!'
          WHEN 3 THEN '🎉 Verified Driver Badge Unlocked!'
          ELSE 'Profile Updated'
        END,
        p_body := CASE v_new_tier
          WHEN 2 THEN 'Congratulations! You can now request rides and message drivers.'
          WHEN 3 THEN 'Congratulations! You can now create and manage rides.'
          ELSE 'Your profile has been updated.'
        END,
        p_metadata := jsonb_build_object(
          'new_tier', v_new_tier,
          'old_tier', v_old_tier
        )
      );
    END IF;
  END IF;

  RETURN v_new_tier;
END;
$function$;

-- ============================================================================
-- REGULAR FUNCTIONS (NOT SECURITY DEFINER, BUT STILL NEED search_path)
-- ============================================================================

-- Function 5: calculate_user_tier
CREATE OR REPLACE FUNCTION calculate_user_tier(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  v_user RECORD;
  v_vehicle_count INTEGER;
  v_tier INTEGER := 1;
BEGIN
  -- Get user profile data
  SELECT
    email_verified,
    first_name,
    last_name,
    profile_picture_url,
    photo_url,
    languages,
    bio
  INTO v_user
  FROM public.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN 1;
  END IF;

  -- TIER 1: Email verified + First & Last name
  IF v_user.email_verified = TRUE
     AND v_user.first_name IS NOT NULL
     AND v_user.first_name != ''
     AND v_user.last_name IS NOT NULL
     AND v_user.last_name != '' THEN
    v_tier := 1;
  ELSE
    RETURN 1;
  END IF;

  -- TIER 2: Tier 1 + Profile picture + At least 1 language
  IF (v_user.profile_picture_url IS NOT NULL OR v_user.photo_url IS NOT NULL)
     AND v_user.languages IS NOT NULL
     AND array_length(v_user.languages, 1) > 0 THEN
    v_tier := 2;
  ELSE
    RETURN v_tier;
  END IF;

  -- TIER 3: Tier 2 + Bio (min 50 chars) + At least 1 vehicle
  SELECT COUNT(*) INTO v_vehicle_count
  FROM public.vehicles
  WHERE user_id = p_user_id;

  IF v_user.bio IS NOT NULL
     AND length(trim(v_user.bio)) >= 50
     AND v_vehicle_count > 0 THEN
    v_tier := 3;
  END IF;

  RETURN v_tier;
END;
$function$;

-- Function 6: is_trip_completed
CREATE OR REPLACE FUNCTION is_trip_completed(ride_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  ride_record RECORD;
  approved_riders UUID[];
  all_marked BOOLEAN;
BEGIN
  -- Get ride info
  SELECT * INTO ride_record FROM public.rides WHERE id = ride_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if 5 hours have passed since arrival
  IF ride_record.arrival_time IS NOT NULL
     AND NOW() >= (ride_record.arrival_time + INTERVAL '5 hours') THEN
    RETURN TRUE;
  END IF;

  -- Get all approved riders for this ride
  SELECT array_agg(rider_id) INTO approved_riders
  FROM public.booking_requests
  WHERE ride_id = ride_id AND status = 'approved';

  -- Check if driver marked complete
  IF NOT ride_record.driver_marked_complete THEN
    RETURN FALSE;
  END IF;

  -- Check if all approved riders marked complete
  IF approved_riders IS NULL OR array_length(approved_riders, 1) = 0 THEN
    -- No riders, just need driver
    RETURN TRUE;
  END IF;

  -- Check if all approved riders are in riders_marked_complete
  all_marked := TRUE;
  FOR i IN 1..array_length(approved_riders, 1) LOOP
    IF NOT (approved_riders[i] = ANY(ride_record.riders_marked_complete)) THEN
      all_marked := FALSE;
      EXIT;
    END IF;
  END LOOP;

  RETURN all_marked;
END;
$function$;

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function 7: trigger_update_user_tier
CREATE OR REPLACE FUNCTION trigger_update_user_tier()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  PERFORM update_user_tier(NEW.id);
  RETURN NEW;
END;
$function$;

-- Function 8: trigger_update_user_tier_on_vehicle_change
CREATE OR REPLACE FUNCTION trigger_update_user_tier_on_vehicle_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM update_user_tier(OLD.user_id);
    RETURN OLD;
  ELSE
    PERFORM update_user_tier(NEW.user_id);
    RETURN NEW;
  END IF;
END;
$function$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_functions INTEGER;
  with_search_path INTEGER;
  missing_search_path INTEGER;
BEGIN
  -- Count all custom functions in public schema (excluding system/extension functions)
  SELECT COUNT(*) INTO total_functions
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname NOT LIKE 'pg_%'
  AND p.proname NOT LIKE 'st_%'
  AND p.proname NOT IN ('vector_in', 'vector_out', 'vector_recv', 'vector_send');

  -- Count functions with search_path set
  SELECT COUNT(*) INTO with_search_path
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND p.proname NOT LIKE 'pg_%'
  AND p.proname NOT LIKE 'st_%'
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
    RAISE NOTICE '✅ ALL custom functions now have search_path set';
    RAISE NOTICE '✅ Security advisor warnings should be resolved';
  END IF;
END $$;

-- ============================================================================
-- RESULT
-- ============================================================================
-- ✅ All 8 remaining functions now have "SET search_path = public"
-- ✅ This completes the security fix for ALL custom functions (26+ total)
-- ✅ Prevents search_path injection attacks across entire database
-- ✅ All Supabase security advisor function warnings will be resolved
-- ============================================================================

COMMENT ON FUNCTION add_rider_to_completed IS 'Marks rider as completed - SECURITY DEFINER with search_path';
COMMENT ON FUNCTION create_system_notification_with_message IS 'Creates notification with optional chat message - SECURITY DEFINER with search_path';
COMMENT ON FUNCTION update_ride_seats_on_cancellation IS 'Frees seats on cancellation - SECURITY DEFINER with search_path';
COMMENT ON FUNCTION update_user_tier IS 'Updates user tier and sends notifications - SECURITY DEFINER with search_path';
COMMENT ON FUNCTION calculate_user_tier IS 'Calculates user tier based on profile - has search_path';
COMMENT ON FUNCTION is_trip_completed IS 'Checks if trip is completed - has search_path';
COMMENT ON FUNCTION trigger_update_user_tier IS 'Trigger to update user tier - has search_path';
COMMENT ON FUNCTION trigger_update_user_tier_on_vehicle_change IS 'Trigger to update tier on vehicle change - has search_path';
