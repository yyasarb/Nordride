-- =====================================================
-- THREE-TIER VERIFICATION SYSTEM
-- =====================================================
-- Tier 1 (Grey): Basic Verified - First Name + Last Name
-- Tier 2 (Blue): Community Verified - Tier 1 + Languages + Interests
-- Tier 3 (Gold): Social Verified - Tier 2 + Social Media Connection
-- =====================================================

-- Add verification tracking columns to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS verification_tier integer DEFAULT 1 CHECK (verification_tier >= 1 AND verification_tier <= 3),
ADD COLUMN IF NOT EXISTS verification_sources jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS verified_social_accounts text[] DEFAULT ARRAY[]::text[];

COMMENT ON COLUMN public.users.verification_tier IS 'Verification tier: 1 (Basic), 2 (Community), 3 (Social Verified)';
COMMENT ON COLUMN public.users.verification_sources IS 'JSON array tracking which verification sources were used';
COMMENT ON COLUMN public.users.verified_social_accounts IS 'Array of connected social accounts: facebook, instagram, spotify';

-- Update current_tier comment to reflect new system
COMMENT ON COLUMN public.users.current_tier IS 'Access tier level: 1 (Browse), 2 (Request Rides), 3 (Offer Rides) - auto-calculated from verification_tier';

-- =====================================================
-- TIER CALCULATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_user_verification_tier(user_id_param uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  calculated_tier integer := 1;
  social_accounts text[] := ARRAY[]::text[];
BEGIN
  -- Get user data
  SELECT
    first_name,
    last_name,
    languages,
    interests,
    facebook_profile_url,
    instagram_profile_url,
    spotify_user_id
  INTO user_record
  FROM public.users
  WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN 1; -- Default to Tier 1 if user not found
  END IF;

  -- TIER 1: Basic Verified (First Name + Last Name)
  -- This is the minimum requirement (email is verified during signup)
  IF user_record.first_name IS NOT NULL
     AND user_record.last_name IS NOT NULL
     AND trim(user_record.first_name) != ''
     AND trim(user_record.last_name) != '' THEN
    calculated_tier := 1;
  ELSE
    -- If basic info missing, stay at tier 1 but flag incomplete
    RETURN 1;
  END IF;

  -- TIER 2: Community Verified (Tier 1 + Languages + Interests)
  IF user_record.languages IS NOT NULL
     AND array_length(user_record.languages, 1) >= 1
     AND user_record.interests IS NOT NULL
     AND array_length(user_record.interests, 1) >= 1 THEN
    calculated_tier := 2;
  ELSE
    RETURN calculated_tier; -- Return Tier 1 if requirements not met
  END IF;

  -- TIER 3: Social Verified (Tier 2 + at least one social connection)
  -- Build array of connected social accounts
  IF user_record.facebook_profile_url IS NOT NULL AND trim(user_record.facebook_profile_url) != '' THEN
    social_accounts := array_append(social_accounts, 'facebook');
  END IF;

  IF user_record.instagram_profile_url IS NOT NULL AND trim(user_record.instagram_profile_url) != '' THEN
    social_accounts := array_append(social_accounts, 'instagram');
  END IF;

  IF user_record.spotify_user_id IS NOT NULL AND trim(user_record.spotify_user_id) != '' THEN
    social_accounts := array_append(social_accounts, 'spotify');
  END IF;

  -- Check if at least one social account is connected
  IF array_length(social_accounts, 1) >= 1 THEN
    calculated_tier := 3;

    -- Update verified_social_accounts array
    UPDATE public.users
    SET verified_social_accounts = social_accounts
    WHERE id = user_id_param;
  END IF;

  RETURN calculated_tier;
END;
$$;

COMMENT ON FUNCTION calculate_user_verification_tier IS 'Calculates user verification tier based on profile completion: Tier 1 (Basic), Tier 2 (Community), Tier 3 (Social)';

-- =====================================================
-- TRIGGER: Auto-update verification tier on profile changes
-- =====================================================
CREATE OR REPLACE FUNCTION update_verification_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tier integer;
BEGIN
  -- Calculate new verification tier
  new_tier := calculate_user_verification_tier(NEW.id);

  -- Update verification_tier if changed
  IF NEW.verification_tier IS DISTINCT FROM new_tier THEN
    NEW.verification_tier := new_tier;
    NEW.tier_updated_at := now();

    -- Also update current_tier (access tier) to match verification tier
    NEW.current_tier := new_tier;
  END IF;

  -- Update social_verified flag for backward compatibility
  IF new_tier >= 3 THEN
    NEW.social_verified := true;
  ELSE
    NEW.social_verified := false;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_verification_tier ON public.users;

-- Create trigger on users table
CREATE TRIGGER trigger_update_verification_tier
  BEFORE INSERT OR UPDATE OF first_name, last_name, languages, interests, facebook_profile_url, instagram_profile_url, spotify_user_id
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_tier();

COMMENT ON TRIGGER trigger_update_verification_tier ON public.users IS 'Auto-calculates and updates verification tier when relevant profile fields change';

-- =====================================================
-- BACKFILL: Calculate verification tier for existing users
-- =====================================================
DO $$
DECLARE
  user_record RECORD;
  new_tier integer;
BEGIN
  -- Loop through all users and recalculate their verification tier
  FOR user_record IN SELECT id FROM public.users LOOP
    new_tier := calculate_user_verification_tier(user_record.id);

    UPDATE public.users
    SET
      verification_tier = new_tier,
      current_tier = new_tier,
      social_verified = (new_tier >= 3),
      tier_updated_at = now()
    WHERE id = user_record.id;
  END LOOP;

  RAISE NOTICE 'Verification tiers recalculated for all existing users';
END $$;

-- =====================================================
-- HELPER FUNCTION: Get tier requirements status
-- =====================================================
CREATE OR REPLACE FUNCTION get_tier_requirements_status(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  result jsonb;
  tier_1_complete boolean := false;
  tier_2_complete boolean := false;
  tier_3_complete boolean := false;
  social_count integer := 0;
BEGIN
  -- Get user data
  SELECT
    first_name,
    last_name,
    languages,
    interests,
    facebook_profile_url,
    instagram_profile_url,
    spotify_user_id,
    verification_tier,
    verified_social_accounts
  INTO user_record
  FROM public.users
  WHERE id = user_id_param;

  IF NOT FOUND THEN
    RETURN '{"error": "User not found"}'::jsonb;
  END IF;

  -- Check Tier 1 requirements
  tier_1_complete := (
    user_record.first_name IS NOT NULL AND trim(user_record.first_name) != '' AND
    user_record.last_name IS NOT NULL AND trim(user_record.last_name) != ''
  );

  -- Check Tier 2 requirements
  tier_2_complete := (
    tier_1_complete AND
    user_record.languages IS NOT NULL AND array_length(user_record.languages, 1) >= 1 AND
    user_record.interests IS NOT NULL AND array_length(user_record.interests, 1) >= 1
  );

  -- Count social connections
  IF user_record.facebook_profile_url IS NOT NULL AND trim(user_record.facebook_profile_url) != '' THEN
    social_count := social_count + 1;
  END IF;
  IF user_record.instagram_profile_url IS NOT NULL AND trim(user_record.instagram_profile_url) != '' THEN
    social_count := social_count + 1;
  END IF;
  IF user_record.spotify_user_id IS NOT NULL AND trim(user_record.spotify_user_id) != '' THEN
    social_count := social_count + 1;
  END IF;

  -- Check Tier 3 requirements
  tier_3_complete := tier_2_complete AND social_count >= 1;

  -- Build result JSON
  result := jsonb_build_object(
    'current_tier', user_record.verification_tier,
    'tier_1', jsonb_build_object(
      'complete', tier_1_complete,
      'requirements', jsonb_build_object(
        'first_name', user_record.first_name IS NOT NULL AND trim(user_record.first_name) != '',
        'last_name', user_record.last_name IS NOT NULL AND trim(user_record.last_name) != ''
      )
    ),
    'tier_2', jsonb_build_object(
      'complete', tier_2_complete,
      'requirements', jsonb_build_object(
        'languages', user_record.languages IS NOT NULL AND array_length(user_record.languages, 1) >= 1,
        'languages_count', COALESCE(array_length(user_record.languages, 1), 0),
        'interests', user_record.interests IS NOT NULL AND array_length(user_record.interests, 1) >= 1,
        'interests_count', COALESCE(array_length(user_record.interests, 1), 0)
      )
    ),
    'tier_3', jsonb_build_object(
      'complete', tier_3_complete,
      'requirements', jsonb_build_object(
        'social_accounts', social_count >= 1,
        'social_count', social_count,
        'facebook', user_record.facebook_profile_url IS NOT NULL AND trim(user_record.facebook_profile_url) != '',
        'instagram', user_record.instagram_profile_url IS NOT NULL AND trim(user_record.instagram_profile_url) != '',
        'spotify', user_record.spotify_user_id IS NOT NULL AND trim(user_record.spotify_user_id) != ''
      )
    ),
    'verified_social_accounts', COALESCE(user_record.verified_social_accounts, ARRAY[]::text[]),
    'next_tier', CASE
      WHEN tier_3_complete THEN null
      WHEN tier_2_complete THEN 3
      WHEN tier_1_complete THEN 2
      ELSE 1
    END
  );

  RETURN result;
END;
$$;

COMMENT ON FUNCTION get_tier_requirements_status IS 'Returns detailed JSON of tier requirements and completion status for a user';

-- =====================================================
-- CREATE INDEX for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_verification_tier ON public.users(verification_tier);
CREATE INDEX IF NOT EXISTS idx_users_verified_social_accounts ON public.users USING GIN(verified_social_accounts);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION calculate_user_verification_tier TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_requirements_status TO authenticated;
