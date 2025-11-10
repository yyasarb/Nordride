-- Migration: Fix Notifications Trigger Error
-- Description: Removes problematic trigger that references non-existent updated_at column
--              This trigger was preventing all UPDATE operations on notifications table

-- ============================================================================
-- ISSUE:
-- The notifications_updated_at trigger was trying to set NEW.updated_at
-- but the notifications table doesn't have an updated_at column.
-- This caused all UPDATE queries to fail with error:
-- "record 'new' has no field 'updated_at'"
--
-- IMPACT:
-- - Users couldn't mark notifications as read
-- - Badge counts couldn't be cleared
-- - All notification updates failed silently
-- ============================================================================

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS notifications_updated_at ON public.notifications;

-- Drop the trigger function as well
DROP FUNCTION IF EXISTS update_notifications_updated_at();

-- ============================================================================
-- RESULT:
-- ✅ UPDATE operations on notifications now work correctly
-- ✅ Users can mark notifications as read
-- ✅ read_at timestamp can be set
-- ✅ Badge counts update properly
-- ============================================================================

COMMENT ON TABLE public.notifications IS 'In-app notifications for ride-related events';
