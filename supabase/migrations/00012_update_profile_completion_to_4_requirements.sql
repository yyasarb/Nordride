-- Update profile completion to check 4 requirements: Photo (25%), Bio (25%), Languages (25%), Interests (25%)
-- Name is NOT part of profile completion (user clarified this)
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id UUID)
RETURNS TABLE(completed BOOLEAN, percentage INTEGER) AS $$
DECLARE
  has_photo BOOLEAN;
  has_bio BOOLEAN;
  has_languages BOOLEAN;
  has_interests BOOLEAN;
  total_requirements INTEGER := 4;
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

  -- Check if user has bio
  SELECT (bio IS NOT NULL AND bio != '')
  INTO has_bio
  FROM public.users
  WHERE id = user_id;

  IF has_bio THEN
    completed_requirements := completed_requirements + 1;
  END IF;

  -- Check if user has at least one language
  SELECT (languages IS NOT NULL AND array_length(languages, 1) > 0)
  INTO has_languages
  FROM public.users
  WHERE id = user_id;

  IF has_languages THEN
    completed_requirements := completed_requirements + 1;
  END IF;

  -- Check if user has at least one interest
  SELECT (interests IS NOT NULL AND array_length(interests, 1) > 0)
  INTO has_interests
  FROM public.users
  WHERE id = user_id;

  IF has_interests THEN
    completed_requirements := completed_requirements + 1;
  END IF;

  -- Calculate percentage (each requirement is worth 25%)
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
