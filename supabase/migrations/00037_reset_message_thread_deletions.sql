-- Migration: Reset Message Thread Soft Deletions
-- Created: 2025-11-10
-- Purpose: Clear soft-delete timestamps from message threads to make messages visible again
-- Context: Testing environment - users need to see their message history

-- Reset all soft-delete timestamps on message threads
-- This makes all threads visible again in the messages inbox
UPDATE public.message_threads
SET
  driver_deleted_at = NULL,
  rider_deleted_at = NULL,
  deletion_audit = jsonb_set(
    COALESCE(deletion_audit, '{}'::jsonb),
    '{reset_at}'::text[],
    to_jsonb(NOW())
  )
WHERE
  driver_deleted_at IS NOT NULL
  OR rider_deleted_at IS NOT NULL;

COMMENT ON TABLE public.message_threads IS 'Message threads - soft deletions reset on 2025-11-10 for testing';
