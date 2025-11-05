-- Align users table with application profile requirements
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Ensure new array column has an explicit default for existing rows
UPDATE public.users
SET interests = COALESCE(interests, '{}'::TEXT[]);

-- Align rides table with round-trip support used by the application
ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS is_round_trip BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS return_departure_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS return_suggested_total_cost INTEGER;
