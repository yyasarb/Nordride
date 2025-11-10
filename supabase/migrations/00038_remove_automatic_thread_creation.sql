-- Migration: Remove Automatic Thread Creation
-- Created: 2025-11-10
-- Purpose: Remove automatic conversation creation on ride insert and booking requests
-- Context: Conversations should only be created when users explicitly click "Contact" button

-- Drop the automatic thread creation trigger and function
DROP TRIGGER IF EXISTS create_message_thread_trigger ON public.rides;
DROP FUNCTION IF EXISTS create_message_thread();

COMMENT ON TABLE public.message_threads IS 'Message threads - automatic creation removed 2025-11-10, now only created on explicit user contact action';
