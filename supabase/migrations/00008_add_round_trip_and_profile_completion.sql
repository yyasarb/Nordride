-- Add round trip fields to rides table
ALTER TABLE public.rides
ADD COLUMN IF NOT EXISTS is_round_trip BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS return_departure_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS return_suggested_total_cost INTEGER;

-- Add profile completion fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;
