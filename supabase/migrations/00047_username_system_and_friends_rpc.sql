-- Migration: Username System Enhancements & Friends RPC
-- Description: Add username tracking, auto-assignment, and friends list RPC function
-- Date: 2025-01-12

-- =====================================================
-- PART 1: USERNAME SYSTEM ENHANCEMENTS
-- =====================================================

-- Add username_changed_at column to track when username was last changed
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMPTZ;

-- Create case-insensitive unique index for username (replacing existing if needed)
DROP INDEX IF EXISTS idx_users_username;
CREATE UNIQUE INDEX idx_users_username_ci ON public.users (LOWER(username)) WHERE username IS NOT NULL;

-- Create index for username_changed_at for rate limit checks
CREATE INDEX IF NOT EXISTS idx_users_username_changed_at ON public.users (username_changed_at) WHERE username_changed_at IS NOT NULL;

-- Reserved usernames table
CREATE TABLE IF NOT EXISTS public.reserved_usernames (
  username TEXT PRIMARY KEY,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert reserved usernames
INSERT INTO public.reserved_usernames (username, reason) VALUES
  ('admin', 'system'),
  ('support', 'system'),
  ('nordride', 'brand'),
  ('moderator', 'system'),
  ('staff', 'system'),
  ('help', 'system'),
  ('info', 'system'),
  ('official', 'system'),
  ('team', 'system'),
  ('root', 'system'),
  ('system', 'system'),
  ('api', 'system'),
  ('www', 'system'),
  ('mail', 'system'),
  ('ftp', 'system')
ON CONFLICT (username) DO NOTHING;

-- Function: Generate unique username for a user
CREATE OR REPLACE FUNCTION generate_unique_username(
  p_first_name TEXT,
  p_last_name TEXT,
  p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_base TEXT;
  v_username TEXT;
  v_suffix INTEGER := 0;
  v_exists BOOLEAN;
  v_is_reserved BOOLEAN;
BEGIN
  -- Sanitize and create base username from first and last name
  v_base := LOWER(REGEXP_REPLACE(
    COALESCE(p_first_name, '') || COALESCE(p_last_name, ''),
    '[^a-z0-9]',
    '',
    'g'
  ));

  -- If base is too short, use user_id prefix
  IF LENGTH(v_base) < 3 THEN
    v_base := 'user' || SUBSTRING(p_user_id::TEXT, 1, 8);
    v_base := REGEXP_REPLACE(v_base, '[^a-z0-9]', '', 'g');
  END IF;

  -- Truncate to max 25 chars to leave room for suffix
  v_base := LEFT(v_base, 25);

  -- Try base username first
  v_username := v_base;

  LOOP
    -- Check if reserved
    SELECT EXISTS(
      SELECT 1 FROM public.reserved_usernames
      WHERE username = v_username
    ) INTO v_is_reserved;

    IF v_is_reserved THEN
      v_suffix := v_suffix + 1;
      v_username := v_base || v_suffix::TEXT;
      CONTINUE;
    END IF;

    -- Check if exists (case-insensitive)
    SELECT EXISTS(
      SELECT 1 FROM public.users
      WHERE LOWER(username) = LOWER(v_username)
      AND id != p_user_id
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;

    v_suffix := v_suffix + 1;
    v_username := v_base || v_suffix::TEXT;

    -- Safety: prevent infinite loop
    IF v_suffix > 9999 THEN
      v_username := 'user' || SUBSTRING(p_user_id::TEXT, 1, 8);
      v_username := REGEXP_REPLACE(v_username, '[^a-z0-9]', '', 'g');
      EXIT;
    END IF;
  END LOOP;

  RETURN v_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if username is available
CREATE OR REPLACE FUNCTION is_username_available(
  p_username TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
  v_is_reserved BOOLEAN;
BEGIN
  -- Check if reserved
  SELECT EXISTS(
    SELECT 1 FROM public.reserved_usernames
    WHERE username = LOWER(p_username)
  ) INTO v_is_reserved;

  IF v_is_reserved THEN
    RETURN FALSE;
  END IF;

  -- Check if exists (case-insensitive), excluding current user
  IF p_user_id IS NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.users
      WHERE LOWER(username) = LOWER(p_username)
    ) INTO v_exists;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM public.users
      WHERE LOWER(username) = LOWER(p_username)
      AND id != p_user_id
    ) INTO v_exists;
  END IF;

  RETURN NOT v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Validate username format
CREATE OR REPLACE FUNCTION validate_username_format(p_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_username IS NULL OR (
    LENGTH(p_username) >= 2 AND
    LENGTH(p_username) <= 30 AND
    p_username ~ '^[a-z0-9]([a-z0-9._]{0,28}[a-z0-9])?$'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update username constraint to use new validation
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_username_check;
ALTER TABLE public.users ADD CONSTRAINT users_username_check
  CHECK (validate_username_format(username));

-- Backfill usernames for users without one
DO $$
DECLARE
  v_user RECORD;
  v_new_username TEXT;
BEGIN
  FOR v_user IN
    SELECT id, first_name, last_name
    FROM public.users
    WHERE username IS NULL
  LOOP
    v_new_username := generate_unique_username(
      v_user.first_name,
      v_user.last_name,
      v_user.id
    );

    UPDATE public.users
    SET username = v_new_username
    WHERE id = v_user.id;
  END LOOP;
END $$;

-- Make username NOT NULL after backfill
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;

-- =====================================================
-- PART 2: FRIENDS RPC FUNCTION
-- =====================================================

-- Function: Get friends with details for a user
CREATE OR REPLACE FUNCTION get_friends_with_details(user_id_param UUID)
RETURNS TABLE (
  user_id UUID,
  friendship_id UUID,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  username TEXT,
  photo_url TEXT,
  profile_picture_url TEXT,
  verification_tier INTEGER,
  accepted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    CASE
      WHEN f.user_id = user_id_param THEN f.friend_id
      ELSE f.user_id
    END AS user_id,
    f.id AS friendship_id,
    u.first_name,
    u.last_name,
    u.full_name,
    u.username,
    u.photo_url,
    u.profile_picture_url,
    u.verification_tier,
    f.accepted_at
  FROM public.friendships f
  INNER JOIN public.users u ON (
    u.id = CASE
      WHEN f.user_id = user_id_param THEN f.friend_id
      ELSE f.user_id
    END
  )
  WHERE (f.user_id = user_id_param OR f.friend_id = user_id_param)
    AND f.status = 'accepted'
  ORDER BY u.last_name, u.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_unique_username(TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_username_available(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_username_format(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_friends_with_details(UUID) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON COLUMN public.users.username_changed_at IS 'Timestamp of last username change for rate limiting';
COMMENT ON TABLE public.reserved_usernames IS 'System-reserved usernames that cannot be claimed by users';
COMMENT ON FUNCTION generate_unique_username(TEXT, TEXT, UUID) IS 'Generates a unique username from first and last name';
COMMENT ON FUNCTION is_username_available(TEXT, UUID) IS 'Checks if a username is available (not reserved or taken)';
COMMENT ON FUNCTION validate_username_format(TEXT) IS 'Validates username format: 2-30 chars, lowercase alphanumeric with dots/underscores';
COMMENT ON FUNCTION get_friends_with_details(UUID) IS 'Returns all accepted friends with profile details for a user';
