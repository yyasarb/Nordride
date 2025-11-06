-- Migration: Add metadata column to messages for system messages and action tracking
-- Description: Adds JSONB metadata column to support system messages with actions,
--              ride request references, and message types

-- ============================================================================
-- Add metadata column to messages table
-- ============================================================================

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.messages.metadata IS 'JSON metadata for system messages, including type, booking_request_id, and action states';

-- ============================================================================
-- Create index for efficient metadata queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_messages_metadata_type
ON public.messages USING GIN ((metadata->'type'));

CREATE INDEX IF NOT EXISTS idx_messages_metadata_booking_request
ON public.messages ((metadata->>'booking_request_id'))
WHERE metadata->>'booking_request_id' IS NOT NULL;

COMMENT ON INDEX idx_messages_metadata_type IS 'Optimizes queries filtering by message type (system, user, etc.)';
COMMENT ON INDEX idx_messages_metadata_booking_request IS 'Optimizes queries for messages related to specific booking requests';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- SUMMARY:
-- ✅ Added metadata JSONB column to messages
-- ✅ Created GIN index for type queries
-- ✅ Created index for booking_request_id lookups
-- ✅ Added column comments for documentation

-- METADATA STRUCTURE EXAMPLES:
-- User message:
-- {}

-- System message (ride request):
-- {
--   "type": "system",
--   "system_type": "ride_request",
--   "booking_request_id": "uuid",
--   "action_state": "pending" | "approved" | "denied"
-- }

-- System message (action result):
-- {
--   "type": "system",
--   "system_type": "request_approved" | "request_denied",
--   "booking_request_id": "uuid",
--   "acted_by": "driver"
-- }
