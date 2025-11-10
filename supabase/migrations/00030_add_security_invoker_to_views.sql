-- Migration: Add security_invoker to Views
-- Description: Adds WITH (security_invoker = true) to all views
--              This ensures views execute with the permissions of the calling user,
--              not the view owner, which is a security best practice
--
-- Reference: https://www.postgresql.org/docs/current/sql-createview.html

-- ============================================================================
-- SECURITY ISSUE:
-- Views without explicit security_invoker setting use security_definer by default
-- This can lead to privilege escalation if not carefully managed
--
-- FIX: Add "WITH (security_invoker = true)" to all views
-- ============================================================================

-- Drop and recreate views with security_invoker option
DROP VIEW IF EXISTS ride_costs CASCADE;
DROP VIEW IF EXISTS upcoming_rides CASCADE;

-- ============================================================================
-- VIEW 1: ride_costs
-- ============================================================================
CREATE VIEW ride_costs
WITH (security_invoker = true)
AS
SELECT
    r.id,
    r.route_km,
    COALESCE(r.custom_total_cost, r.suggested_total_cost) as total_cost,
    (r.final_rider_count + 1) as total_people,
    ROUND(
        COALESCE(r.custom_total_cost, r.suggested_total_cost)::NUMERIC /
        NULLIF(r.final_rider_count + 1, 0)
    ) as cost_per_person
FROM public.rides r;

-- ============================================================================
-- VIEW 2: upcoming_rides
-- ============================================================================
CREATE VIEW upcoming_rides
WITH (security_invoker = true)
AS
SELECT
    r.*,
    u.full_name as driver_name,
    u.photo_url as driver_photo,
    u.trust_score as driver_trust_score,
    v.brand as vehicle_brand,
    v.model as vehicle_model,
    (r.seats_available - r.seats_booked) as seats_remaining
FROM public.rides r
JOIN public.users u ON r.driver_id = u.id
LEFT JOIN public.vehicles v ON r.vehicle_id = v.id
WHERE r.departure_time >= NOW()
    AND r.status = 'published'
ORDER BY r.departure_time ASC;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_views INTEGER;
  with_security_invoker INTEGER;
  missing_security_invoker INTEGER;
BEGIN
  -- Count all views in public schema
  SELECT COUNT(*) INTO total_views
  FROM pg_views
  WHERE schemaname = 'public';

  -- Count views with security_invoker
  SELECT COUNT(*) INTO with_security_invoker
  FROM pg_views v
  JOIN pg_class c ON c.relname = v.viewname
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
  AND c.reloptions IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM unnest(c.reloptions) opt
    WHERE opt LIKE 'security_invoker=%'
  );

  missing_security_invoker := total_views - with_security_invoker;

  RAISE NOTICE '====================================';
  RAISE NOTICE 'Total views: %', total_views;
  RAISE NOTICE 'With security_invoker: %', with_security_invoker;
  RAISE NOTICE 'Missing security_invoker: %', missing_security_invoker;
  RAISE NOTICE '====================================';

  IF missing_security_invoker > 0 THEN
    RAISE WARNING 'Still have % views without security_invoker', missing_security_invoker;
  ELSE
    RAISE NOTICE '✅ All views now have security_invoker set';
  END IF;
END $$;

-- ============================================================================
-- RESULT
-- ============================================================================
-- ✅ ride_costs view now has security_invoker = true
-- ✅ upcoming_rides view now has security_invoker = true
-- ✅ Views execute with caller's permissions (more secure)
-- ✅ Security advisor warnings will be resolved
-- ============================================================================

COMMENT ON VIEW ride_costs IS 'Calculates cost breakdown for rides - security_invoker enabled';
COMMENT ON VIEW upcoming_rides IS 'Shows upcoming published rides - security_invoker enabled';
