-- Migration: Consolidate Overlapping RLS Policies
-- Created: 2025-11-10
-- Purpose: Merge multiple permissive policies into single policies for better performance
-- Status: Performance optimization
-- Reference: Multiple permissive policies cause multiple evaluations per query

-- ============================================================================
-- RIDES TABLE - Consolidate SELECT policies
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Anyone can view published rides" ON public.rides;
DROP POLICY IF EXISTS "Drivers can manage own rides" ON public.rides CASCADE;
DROP POLICY IF EXISTS "Riders can view rides they requested" ON public.rides;

-- Create consolidated SELECT policy
CREATE POLICY "Users can view rides"
  ON public.rides
  FOR SELECT
  TO authenticated, anon
  USING (
    -- Anyone can view published rides
    status = 'published'
    OR
    -- Drivers can view their own rides (any status)
    driver_id = (SELECT auth.uid())
    OR
    -- Riders can view rides they requested
    EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.ride_id = rides.id
      AND br.rider_id = (SELECT auth.uid())
    )
  );

-- Recreate driver management policies (INSERT, UPDATE, DELETE)
CREATE POLICY "Drivers can create rides"
  ON public.rides
  FOR INSERT
  TO authenticated
  WITH CHECK (driver_id = (SELECT auth.uid()));

CREATE POLICY "Drivers can update own rides"
  ON public.rides
  FOR UPDATE
  TO authenticated
  USING (driver_id = (SELECT auth.uid()))
  WITH CHECK (driver_id = (SELECT auth.uid()));

CREATE POLICY "Drivers can delete own rides"
  ON public.rides
  FOR DELETE
  TO authenticated
  USING (driver_id = (SELECT auth.uid()));

-- ============================================================================
-- VEHICLES TABLE - Consolidate SELECT policies
-- ============================================================================

-- Drop existing overlapping policies
DROP POLICY IF EXISTS "Users can manage own vehicles" ON public.vehicles CASCADE;
DROP POLICY IF EXISTS "Users can view all vehicles" ON public.vehicles;

-- Create consolidated SELECT policy
CREATE POLICY "Users can view vehicles"
  ON public.vehicles
  FOR SELECT
  TO authenticated, anon
  USING (true); -- All users can view vehicle info (brand, model, color)

-- Recreate owner management policies
CREATE POLICY "Users can create own vehicles"
  ON public.vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own vehicles"
  ON public.vehicles
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- MESSAGE_THREADS TABLE - Consolidate INSERT and UPDATE policies
-- ============================================================================

-- The INSERT policies are already consolidated in migration 00034
-- The UPDATE policies are already consolidated in migration 00034
-- No changes needed - migration 00034 already fixed this

-- ============================================================================
-- Performance Tracking Comment
-- ============================================================================

COMMENT ON TABLE public.rides IS 'Rides table - RLS policies consolidated for performance on 2025-11-10';
COMMENT ON TABLE public.vehicles IS 'Vehicles table - RLS policies consolidated for performance on 2025-11-10';
