-- Enable Supabase Realtime on messages and message_threads tables
-- This allows real-time subscriptions to work for chat functionality

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;
