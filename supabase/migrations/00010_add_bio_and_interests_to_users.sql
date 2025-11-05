-- Add interests array to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS interests TEXT[];
