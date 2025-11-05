-- Update profile completion to remove email verification requirement
-- Now checking: Photo, Name, Bio
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS TABLE(completed BOOLEAN, percentage INTEGER) AS $$
DECLARE
  has_photo BOOLEAN;
  has_name BOOLEAN;
  has_bio BOOLEAN;
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

  -- Check if user has bio
  SELECT (bio IS NOT NULL AND bio != '')
  INTO has_bio
  FROM public.users
  WHERE id = user_id;

  IF has_bio THEN
    completed_requirements := completed_requirements + 1;
  END IF;

  -- Calculate percentage (each requirement is worth ~33%)
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
