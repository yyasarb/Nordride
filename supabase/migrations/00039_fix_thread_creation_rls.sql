-- Migration: Fix Message Thread Creation RLS
-- Created: 2025-11-10
-- Purpose: Allow any authenticated user to create message threads for rides or direct messages
-- Issue: 403 Forbidden when riders try to contact drivers
-- Fix: Removed restrictive driver-only policies, added comprehensive policy

-- Reset soft-delete timestamps (threads were marked as deleted again)
UPDATE public.message_threads
SET
  driver_deleted_at = NULL,
  rider_deleted_at = NULL,
  deletion_audit = jsonb_set(
    COALESCE(deletion_audit, '{}'::jsonb),
    '{reset_at_2}'::text[],
    to_jsonb(NOW())
  )
WHERE
  driver_deleted_at IS NOT NULL
  OR rider_deleted_at IS NOT NULL;

-- Drop the duplicate and restrictive INSERT policies
DROP POLICY IF EXISTS "Drivers can create message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Drivers can create message threads for their rides" ON public.message_threads;

-- Create new comprehensive INSERT policy that allows:
-- 1. Any authenticated user to create threads for any ride (riders contacting drivers)
-- 2. Any authenticated user to create direct message threads where they are a participant
CREATE POLICY "Users can create message threads"
  ON public.message_threads
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if creating a ride-based thread (any user can contact about any ride)
    ride_id IS NOT NULL
    OR
    -- Allow if creating direct message thread where user is one of the participants
    (ride_id IS NULL AND (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid())))
  );

COMMENT ON POLICY "Users can create message threads" ON public.message_threads
  IS 'Allows any authenticated user to create message threads for rides or direct messages';
