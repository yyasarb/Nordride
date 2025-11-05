-- Add profile_picture_url to users table (separate from photo_url for better clarity)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Create or replace profile completion calculation function
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS TABLE(completed BOOLEAN, percentage INTEGER) AS $$
DECLARE
  has_photo BOOLEAN;
  has_name BOOLEAN;
  has_email BOOLEAN;
  total_requirements INTEGER := 3;
  completed_requirements INTEGER := 0;
  completion_pct INTEGER;
  is_completed BOOLEAN;
BEGIN
  -- Check if user has profile picture
  SELECT (photo_url IS NOT NULL OR profile_picture_url IS NOT NULL)
  INTO has_photo
  FROM public.users
  WHERE id = user_id;

  IF has_photo THEN
    completed_requirements := completed_requirements + 1;
  END IF;

  -- Check if user has full name
  SELECT (full_name IS NOT NULL AND full_name != '')
  INTO has_name
  FROM public.users
  WHERE id = user_id;

  IF has_name THEN
    completed_requirements := completed_requirements + 1;
  END IF;

  -- Check if email is verified
  SELECT (email_verified = true)
  INTO has_email
  FROM public.users
  WHERE id = user_id;

  IF has_email THEN
    completed_requirements := completed_requirements + 1;
  END IF;

  -- Calculate percentage
  completion_pct := (completed_requirements * 100) / total_requirements;
  is_completed := (completed_requirements = total_requirements);

  -- Update user record
  UPDATE public.users
  SET
    profile_completion_percentage = completion_pct,
    profile_completed = is_completed
  WHERE id = user_id;

  RETURN QUERY SELECT is_completed, completion_pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
