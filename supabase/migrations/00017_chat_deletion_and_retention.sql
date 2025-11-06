-- Migration: GDPR-Compliant Chat Deletion & Data Retention System
-- Description: Adds soft-delete functionality for message threads, cleanup functions,
--              and retention policies compliant with GDPR Article 5(1)(e)

-- ============================================================================
-- STEP 1: Add soft-delete columns to message_threads
-- ============================================================================

ALTER TABLE public.message_threads
ADD COLUMN IF NOT EXISTS driver_deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rider_deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS deletion_audit JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.message_threads.driver_deleted_at IS 'Timestamp when driver deleted this conversation from their view';
COMMENT ON COLUMN public.message_threads.rider_deleted_at IS 'Timestamp when rider deleted this conversation from their view';
COMMENT ON COLUMN public.message_threads.last_message_at IS 'Timestamp of most recent message, used for inactivity-based cleanup';
COMMENT ON COLUMN public.message_threads.deletion_audit IS 'JSON audit log of deletion events for GDPR compliance';

-- ============================================================================
-- STEP 2: Create trigger to auto-update last_message_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.message_threads
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.thread_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_thread_last_message_trigger ON public.messages;
CREATE TRIGGER update_thread_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_last_message();

-- ============================================================================
-- STEP 3: Add DELETE RLS policies for message_threads
-- ============================================================================

-- Allow drivers to soft-delete their view of the thread
CREATE POLICY "Drivers can soft-delete message threads"
ON public.message_threads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = message_threads.ride_id
    AND r.driver_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = message_threads.ride_id
    AND r.driver_id = auth.uid()
  )
);

-- Allow riders to soft-delete their view of the thread
CREATE POLICY "Riders can soft-delete message threads"
ON public.message_threads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = message_threads.ride_id
    AND EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.ride_id = r.id
      AND br.rider_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rides r
    WHERE r.id = message_threads.ride_id
    AND EXISTS (
      SELECT 1 FROM public.booking_requests br
      WHERE br.ride_id = r.id
      AND br.rider_id = auth.uid()
    )
  )
);

-- ============================================================================
-- STEP 4: Function to hard-delete fully deleted threads
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_fully_deleted_threads()
RETURNS TABLE(deleted_count INTEGER, deleted_thread_ids UUID[]) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_deleted_ids UUID[];
BEGIN
  -- Find threads where both driver and rider have deleted
  WITH threads_to_delete AS (
    SELECT mt.id, mt.ride_id
    FROM public.message_threads mt
    WHERE mt.driver_deleted_at IS NOT NULL
      AND mt.rider_deleted_at IS NOT NULL
  ),
  -- Update audit log before deletion
  audit_update AS (
    UPDATE public.message_threads mt
    SET deletion_audit = jsonb_build_object(
      'final_deletion_at', NOW(),
      'driver_deleted_at', mt.driver_deleted_at,
      'rider_deleted_at', mt.rider_deleted_at,
      'deleted_by', 'cleanup_function',
      'reason', 'both_users_deleted'
    )
    FROM threads_to_delete ttd
    WHERE mt.id = ttd.id
    RETURNING mt.id
  ),
  -- Collect IDs for return
  collected_ids AS (
    SELECT ARRAY_AGG(id) as ids
    FROM audit_update
  ),
  -- Delete the threads (cascades to messages)
  deletion AS (
    DELETE FROM public.message_threads mt
    USING threads_to_delete ttd
    WHERE mt.id = ttd.id
    RETURNING mt.id
  )
  SELECT COUNT(*)::INTEGER, COALESCE(ARRAY_AGG(id), ARRAY[]::UUID[])
  INTO v_deleted_count, v_deleted_ids
  FROM deletion;

  RETURN QUERY SELECT v_deleted_count, v_deleted_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_fully_deleted_threads() IS 'Hard deletes message threads where both driver and rider have soft-deleted. Called by scheduled job.';

-- ============================================================================
-- STEP 5: Function to cleanup inactive threads (6+ months)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_inactive_threads()
RETURNS TABLE(deleted_count INTEGER, deleted_thread_ids UUID[]) AS $$
DECLARE
  v_deleted_count INTEGER := 0;
  v_deleted_ids UUID[];
  v_retention_months INTEGER := 6; -- GDPR retention: 6 months of inactivity
BEGIN
  -- Find threads with no messages in past 6 months
  WITH threads_to_delete AS (
    SELECT mt.id, mt.ride_id, mt.last_message_at
    FROM public.message_threads mt
    WHERE mt.last_message_at < NOW() - INTERVAL '6 months'
      -- Only delete threads for completed or cancelled rides
      AND EXISTS (
        SELECT 1 FROM public.rides r
        WHERE r.id = mt.ride_id
        AND r.status IN ('completed', 'cancelled')
      )
  ),
  -- Update audit log before deletion
  audit_update AS (
    UPDATE public.message_threads mt
    SET deletion_audit = jsonb_build_object(
      'final_deletion_at', NOW(),
      'last_message_at', mt.last_message_at,
      'deleted_by', 'auto_cleanup',
      'reason', 'inactive_6_months',
      'retention_policy', 'GDPR Article 5(1)(e) - Storage Limitation'
    )
    FROM threads_to_delete ttd
    WHERE mt.id = ttd.id
    RETURNING mt.id
  ),
  -- Collect IDs for return
  collected_ids AS (
    SELECT ARRAY_AGG(id) as ids
    FROM audit_update
  ),
  -- Delete the threads (cascades to messages)
  deletion AS (
    DELETE FROM public.message_threads mt
    USING threads_to_delete ttd
    WHERE mt.id = ttd.id
    RETURNING mt.id
  )
  SELECT COUNT(*)::INTEGER, COALESCE(ARRAY_AGG(id), ARRAY[]::UUID[])
  INTO v_deleted_count, v_deleted_ids
  FROM deletion;

  RETURN QUERY SELECT v_deleted_count, v_deleted_ids;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_inactive_threads() IS 'Auto-deletes message threads inactive for 6+ months (GDPR compliance). Called by scheduled job.';

-- ============================================================================
-- STEP 6: Helper function to check if thread should be hard-deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION check_and_cleanup_thread(p_thread_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_thread RECORD;
  v_deleted BOOLEAN := FALSE;
BEGIN
  -- Get thread deletion status
  SELECT
    driver_deleted_at,
    rider_deleted_at
  INTO v_thread
  FROM public.message_threads
  WHERE id = p_thread_id;

  -- If both users have deleted, trigger hard delete
  IF v_thread.driver_deleted_at IS NOT NULL AND v_thread.rider_deleted_at IS NOT NULL THEN
    -- Update audit log
    UPDATE public.message_threads
    SET deletion_audit = jsonb_build_object(
      'final_deletion_at', NOW(),
      'driver_deleted_at', v_thread.driver_deleted_at,
      'rider_deleted_at', v_thread.rider_deleted_at,
      'deleted_by', 'both_users',
      'reason', 'mutual_deletion'
    )
    WHERE id = p_thread_id;

    -- Hard delete the thread (cascades to messages)
    DELETE FROM public.message_threads
    WHERE id = p_thread_id;

    v_deleted := TRUE;
  END IF;

  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_and_cleanup_thread(UUID) IS 'Checks if both users deleted a thread and performs hard delete if so. Returns TRUE if deleted.';

-- ============================================================================
-- STEP 7: Update existing threads with last_message_at
-- ============================================================================

-- Backfill last_message_at for existing threads based on their most recent message
UPDATE public.message_threads mt
SET last_message_at = COALESCE(
  (
    SELECT MAX(m.created_at)
    FROM public.messages m
    WHERE m.thread_id = mt.id
  ),
  mt.created_at
);

-- ============================================================================
-- STEP 8: Create index for performance on deletion queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_message_threads_deletion_status
ON public.message_threads(driver_deleted_at, rider_deleted_at)
WHERE driver_deleted_at IS NOT NULL OR rider_deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_message_threads_last_message
ON public.message_threads(last_message_at);

COMMENT ON INDEX idx_message_threads_deletion_status IS 'Optimizes queries for finding deleted threads during cleanup';
COMMENT ON INDEX idx_message_threads_last_message IS 'Optimizes queries for finding inactive threads during retention cleanup';

-- ============================================================================
-- STEP 9: Grant execute permissions
-- ============================================================================

-- Note: These functions are SECURITY DEFINER, so they run with owner privileges
-- We still grant execute to authenticated users for explicit access control
GRANT EXECUTE ON FUNCTION cleanup_fully_deleted_threads() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_inactive_threads() TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_cleanup_thread(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_thread_last_message() TO authenticated;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- SUMMARY:
-- ✅ Added soft-delete columns (driver_deleted_at, rider_deleted_at)
-- ✅ Added activity tracking (last_message_at)
-- ✅ Added audit logging (deletion_audit)
-- ✅ Created trigger to auto-update last_message_at
-- ✅ Added UPDATE RLS policies for soft-delete
-- ✅ Created cleanup_fully_deleted_threads() function
-- ✅ Created cleanup_inactive_threads() function (6-month retention)
-- ✅ Created check_and_cleanup_thread() helper function
-- ✅ Backfilled last_message_at for existing threads
-- ✅ Added performance indexes
-- ✅ Granted necessary permissions

-- NEXT STEPS:
-- 1. Set up Supabase cron job to run cleanup functions daily
-- 2. Update UI to show delete button and handle soft-delete
-- 3. Update Privacy Policy with retention information
-- 4. Test deletion flows thoroughly

-- CRON JOB SETUP (via Supabase Dashboard or CLI):
-- Schedule: 0 2 * * * (daily at 2 AM UTC)
-- SQL: SELECT cleanup_fully_deleted_threads(); SELECT cleanup_inactive_threads();
