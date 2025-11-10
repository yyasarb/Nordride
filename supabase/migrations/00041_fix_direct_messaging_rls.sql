-- Migration: Fix RLS Policies for Direct User-to-User Messaging
-- Created: 2025-11-10
-- Purpose: Update RLS policies to allow viewing/using direct message threads
-- Issue: Old policies only allowed ride-based threads, blocking direct user chats

-- ============================================================================
-- MESSAGE_THREADS TABLE - Fix SELECT policy
-- ============================================================================

-- Drop old ride-based SELECT policies
DROP POLICY IF EXISTS "Users can view message threads for their rides" ON public.message_threads;
DROP POLICY IF EXISTS "Users can view their message threads" ON public.message_threads;

-- Create new policy for direct user-to-user threads
CREATE POLICY "Users can view their direct message threads"
  ON public.message_threads
  FOR SELECT
  TO authenticated
  USING (
    -- User is either user1 or user2 in the thread
    user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid())
  );

-- ============================================================================
-- MESSAGE_THREADS TABLE - Fix UPDATE policy
-- ============================================================================

DROP POLICY IF EXISTS "Users can update message threads for their rides" ON public.message_threads;
DROP POLICY IF EXISTS "Drivers can soft-delete message threads" ON public.message_threads;
DROP POLICY IF EXISTS "Riders can soft-delete message threads" ON public.message_threads;

CREATE POLICY "Users can update their threads"
  ON public.message_threads
  FOR UPDATE
  TO authenticated
  USING (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid()))
  WITH CHECK (user1_id = (SELECT auth.uid()) OR user2_id = (SELECT auth.uid()));

-- ============================================================================
-- MESSAGES TABLE - Fix all policies
-- ============================================================================

-- Drop old ride-based policies
DROP POLICY IF EXISTS "Users can view messages for their rides" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages in their threads" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their threads" ON public.messages;

-- Create new policies for direct messaging
CREATE POLICY "Users can view their messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.user1_id = (SELECT auth.uid()) OR mt.user2_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can send messages in their threads"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT auth.uid()) AND
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.user1_id = (SELECT auth.uid()) OR mt.user2_id = (SELECT auth.uid()))
    )
  );

CREATE POLICY "Users can update their messages"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = messages.thread_id
      AND (mt.user1_id = (SELECT auth.uid()) OR mt.user2_id = (SELECT auth.uid()))
    )
  );

COMMENT ON TABLE public.message_threads IS 'Message threads - RLS updated for direct user-to-user messaging on 2025-11-10';
COMMENT ON TABLE public.messages IS 'Messages - RLS updated for direct user-to-user messaging on 2025-11-10';
