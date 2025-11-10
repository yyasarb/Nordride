-- Migration: Convert to Direct User-to-User Messaging Only
-- Created: 2025-11-10
-- Purpose: Remove ride-based messaging, enable only direct user chats
-- Context: Simplify messaging system - users chat directly with each other, not through rides

-- Delete all existing messages and threads (fresh start)
DELETE FROM public.messages;
DELETE FROM public.message_threads;

COMMENT ON TABLE public.message_threads IS 'Message threads - converted to direct user-to-user messaging only on 2025-11-10. No ride-based threads.';
COMMENT ON TABLE public.messages IS 'Messages - part of direct user-to-user conversations only.';
