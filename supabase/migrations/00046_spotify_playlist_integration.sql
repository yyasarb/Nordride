-- Migration: Spotify Playlist Integration
-- Description: Add Spotify OAuth and playlist linking fields to users table
-- Date: 2025-11-11

-- Add Spotify-related columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS spotify_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS spotify_user_id TEXT,
ADD COLUMN IF NOT EXISTS spotify_display_name TEXT,
ADD COLUMN IF NOT EXISTS spotify_email TEXT,
ADD COLUMN IF NOT EXISTS spotify_access_token TEXT,
ADD COLUMN IF NOT EXISTS spotify_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS spotify_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS spotify_playlist_id TEXT,
ADD COLUMN IF NOT EXISTS spotify_playlist_name TEXT,
ADD COLUMN IF NOT EXISTS spotify_playlist_url TEXT,
ADD COLUMN IF NOT EXISTS spotify_playlist_image TEXT,
ADD COLUMN IF NOT EXISTS spotify_playlist_owner TEXT,
ADD COLUMN IF NOT EXISTS spotify_playlist_track_count INTEGER,
ADD COLUMN IF NOT EXISTS spotify_playlist_is_collaborative BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS spotify_connected_at TIMESTAMPTZ;

-- Create index for faster Spotify user lookups
CREATE INDEX IF NOT EXISTS idx_users_spotify_user_id ON users(spotify_user_id);
CREATE INDEX IF NOT EXISTS idx_users_spotify_connected ON users(spotify_connected) WHERE spotify_connected = TRUE;

-- Add RLS policy for Spotify tokens (only user can see their own tokens)
-- Note: Tokens should ideally be stored in a separate secure table, but for simplicity keeping in users table

-- Update verification tier trigger to include Spotify connection
-- This updates the existing trigger to account for Spotify as a social verification source
CREATE OR REPLACE FUNCTION update_verification_tier()
RETURNS TRIGGER AS $$
DECLARE
  new_tier INTEGER;
  new_sources JSONB := '[]'::jsonb;
  social_accounts TEXT[] := ARRAY[]::text[];
BEGIN
  -- Calculate verification tier
  new_tier := calculate_user_verification_tier(NEW.id);

  -- Track verification sources
  IF NEW.first_name IS NOT NULL AND NEW.first_name != '' THEN
    new_sources := new_sources || '["name"]'::jsonb;
  END IF;

  IF NEW.languages IS NOT NULL AND array_length(NEW.languages, 1) > 0 THEN
    new_sources := new_sources || '["languages"]'::jsonb;
  END IF;

  IF NEW.interests IS NOT NULL AND array_length(NEW.interests, 1) > 0 THEN
    new_sources := new_sources || '["interests"]'::jsonb;
  END IF;

  -- Track social accounts
  IF NEW.facebook_profile_url IS NOT NULL AND NEW.facebook_profile_url != '' THEN
    new_sources := new_sources || '["facebook"]'::jsonb;
    social_accounts := array_append(social_accounts, 'facebook');
  END IF;

  IF NEW.instagram_profile_url IS NOT NULL AND NEW.instagram_profile_url != '' THEN
    new_sources := new_sources || '["instagram"]'::jsonb;
    social_accounts := array_append(social_accounts, 'instagram');
  END IF;

  IF NEW.spotify_user_id IS NOT NULL AND NEW.spotify_user_id != '' THEN
    new_sources := new_sources || '["spotify"]'::jsonb;
    social_accounts := array_append(social_accounts, 'spotify');
  END IF;

  -- Update fields
  NEW.verification_tier := new_tier;
  NEW.current_tier := new_tier;
  NEW.verification_sources := new_sources;
  NEW.verified_social_accounts := social_accounts;
  NEW.social_verified := (new_tier >= 3);
  NEW.tier_updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update calculate_user_verification_tier function to include Spotify
CREATE OR REPLACE FUNCTION calculate_user_verification_tier(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  user_record RECORD;
  tier INTEGER := 1;
BEGIN
  -- Fetch user data
  SELECT
    first_name,
    last_name,
    languages,
    interests,
    facebook_profile_url,
    instagram_profile_url,
    spotify_user_id
  INTO user_record
  FROM users
  WHERE id = user_id_param;

  -- If user not found, return tier 1
  IF NOT FOUND THEN
    RETURN 1;
  END IF;

  -- Tier 1: Basic - First Name + Last Name
  IF user_record.first_name IS NOT NULL
     AND user_record.first_name != ''
     AND user_record.last_name IS NOT NULL
     AND user_record.last_name != '' THEN
    tier := 1;
  ELSE
    RETURN 1;
  END IF;

  -- Tier 2: Community - Tier 1 + Languages (≥1) + Interests (≥1)
  IF (user_record.languages IS NOT NULL AND array_length(user_record.languages, 1) >= 1)
     AND (user_record.interests IS NOT NULL AND array_length(user_record.interests, 1) >= 1) THEN
    tier := 2;
  ELSE
    RETURN tier;
  END IF;

  -- Tier 3: Social - Tier 2 + At least one social account
  IF (user_record.facebook_profile_url IS NOT NULL AND user_record.facebook_profile_url != '')
     OR (user_record.instagram_profile_url IS NOT NULL AND user_record.instagram_profile_url != '')
     OR (user_record.spotify_user_id IS NOT NULL AND user_record.spotify_user_id != '') THEN
    tier := 3;
  END IF;

  RETURN tier;
END;
$$ LANGUAGE plpgsql;

-- Update get_tier_requirements_status to include Spotify
CREATE OR REPLACE FUNCTION get_tier_requirements_status(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  user_record RECORD;
  result JSONB;
  current_tier INTEGER;
  tier_1_complete BOOLEAN;
  tier_2_complete BOOLEAN;
  tier_3_complete BOOLEAN;
  social_accounts TEXT[] := ARRAY[]::text[];
  social_count INTEGER := 0;
BEGIN
  -- Fetch user data
  SELECT
    first_name,
    last_name,
    languages,
    interests,
    facebook_profile_url,
    instagram_profile_url,
    spotify_user_id,
    verified_social_accounts
  INTO user_record
  FROM users
  WHERE id = user_id_param;

  -- Calculate current tier
  current_tier := calculate_user_verification_tier(user_id_param);

  -- Check Tier 1 completion
  tier_1_complete := (
    user_record.first_name IS NOT NULL AND user_record.first_name != ''
    AND user_record.last_name IS NOT NULL AND user_record.last_name != ''
  );

  -- Check Tier 2 completion
  tier_2_complete := (
    tier_1_complete
    AND user_record.languages IS NOT NULL AND array_length(user_record.languages, 1) >= 1
    AND user_record.interests IS NOT NULL AND array_length(user_record.interests, 1) >= 1
  );

  -- Check social accounts
  IF user_record.facebook_profile_url IS NOT NULL AND user_record.facebook_profile_url != '' THEN
    social_count := social_count + 1;
  END IF;

  IF user_record.instagram_profile_url IS NOT NULL AND user_record.instagram_profile_url != '' THEN
    social_count := social_count + 1;
  END IF;

  IF user_record.spotify_user_id IS NOT NULL AND user_record.spotify_user_id != '' THEN
    social_count := social_count + 1;
  END IF;

  -- Check Tier 3 completion
  tier_3_complete := (tier_2_complete AND social_count >= 1);

  -- Build result JSON
  result := jsonb_build_object(
    'current_tier', current_tier,
    'tier_1', jsonb_build_object(
      'complete', tier_1_complete,
      'requirements', jsonb_build_object(
        'first_name', user_record.first_name IS NOT NULL AND user_record.first_name != '',
        'last_name', user_record.last_name IS NOT NULL AND user_record.last_name != ''
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
        'facebook', user_record.facebook_profile_url IS NOT NULL AND user_record.facebook_profile_url != '',
        'instagram', user_record.instagram_profile_url IS NOT NULL AND user_record.instagram_profile_url != '',
        'spotify', user_record.spotify_user_id IS NOT NULL AND user_record.spotify_user_id != ''
      )
    ),
    'verified_social_accounts', COALESCE(user_record.verified_social_accounts, ARRAY[]::text[]),
    'next_tier', CASE
      WHEN current_tier < 3 THEN current_tier + 1
      ELSE NULL
    END
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_user_verification_tier TO authenticated;
GRANT EXECUTE ON FUNCTION get_tier_requirements_status TO authenticated;

-- Add comment
COMMENT ON COLUMN users.spotify_connected IS 'Whether user has connected their Spotify account via OAuth';
COMMENT ON COLUMN users.spotify_playlist_id IS 'ID of the selected road playlist for rides';
COMMENT ON COLUMN users.spotify_playlist_name IS 'Name of the selected playlist';
COMMENT ON COLUMN users.spotify_playlist_url IS 'External Spotify URL for the playlist';
COMMENT ON COLUMN users.spotify_playlist_image IS 'Cover art URL for the playlist';
COMMENT ON COLUMN users.spotify_playlist_track_count IS 'Cached count of tracks in the playlist';
COMMENT ON COLUMN users.spotify_playlist_is_collaborative IS 'Whether the playlist is collaborative';
