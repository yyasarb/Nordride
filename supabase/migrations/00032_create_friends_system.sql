-- ========================================
-- NORDRIDE FRIENDS SYSTEM
-- Migration: 00032_create_friends_system
-- Description: Complete friends and blocking system
-- ========================================

-- 1. CREATE FRIENDSHIPS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  message TEXT CHECK (LENGTH(message) <= 200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent self-friendship
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id),

  -- Prevent duplicate friendships
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id)
);

-- Ensure bidirectional uniqueness (A->B and B->A should not both exist)
CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_bidirectional
ON public.friendships (LEAST(user_id, friend_id), GREATEST(user_id, friend_id));

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_friendships_user_status ON public.friendships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_status ON public.friendships(friend_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_pending ON public.friendships(friend_id, status)
  WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_friendships_accepted ON public.friendships(user_id, status)
  WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_friendships_requested_at ON public.friendships(requested_at);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friendships
CREATE POLICY "Users can view their own friendships"
  ON public.friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friend requests"
  ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendship requests"
  ON public.friendships FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships"
  ON public.friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 2. CREATE BLOCKED USERS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,

  -- Prevent self-blocking
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_id),

  -- Prevent duplicate blocks
  CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_id);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blocked_users
CREATE POLICY "Users can view their own blocks"
  ON public.blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can create blocks"
  ON public.blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can delete their own blocks"
  ON public.blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- 3. ADD FRIEND_COUNT TO USERS TABLE
-- ========================================

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS friend_count INT DEFAULT 0;

-- Create index for friend_count (useful for sorting/filtering)
CREATE INDEX IF NOT EXISTS idx_users_friend_count ON public.users(friend_count);

-- 4. CREATE TRIGGER FUNCTION FOR FRIEND COUNT
-- ========================================

CREATE OR REPLACE FUNCTION public.update_friend_count()
RETURNS TRIGGER AS $$
BEGIN
  -- When a friendship is accepted
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE public.users SET friend_count = friend_count + 1
    WHERE id IN (NEW.user_id, NEW.friend_id);

  -- When an accepted friendship is deleted
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE public.users SET friend_count = GREATEST(0, friend_count - 1)
    WHERE id IN (OLD.user_id, OLD.friend_id);

  -- When a friendship status changes
  ELSIF TG_OP = 'UPDATE' THEN
    -- From accepted to something else (decrement)
    IF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
      UPDATE public.users SET friend_count = GREATEST(0, friend_count - 1)
      WHERE id IN (OLD.user_id, OLD.friend_id);

    -- From something else to accepted (increment)
    ELSIF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
      UPDATE public.users SET friend_count = friend_count + 1
      WHERE id IN (NEW.user_id, NEW.friend_id);
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_friend_count ON public.friendships;
CREATE TRIGGER trigger_update_friend_count
AFTER INSERT OR UPDATE OR DELETE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.update_friend_count();

-- 5. CREATE MUTUAL FRIENDS FUNCTION
-- ========================================

CREATE OR REPLACE FUNCTION public.get_mutual_friends(
  user_a UUID,
  user_b UUID
)
RETURNS TABLE (
  friend_id UUID,
  friend_first_name TEXT,
  friend_last_name TEXT,
  friend_avatar TEXT,
  friend_tier INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    u.id AS friend_id,
    u.first_name AS friend_first_name,
    u.last_name AS friend_last_name,
    COALESCE(u.profile_picture_url, u.photo_url) AS friend_avatar,
    u.current_tier AS friend_tier
  FROM public.users u
  INNER JOIN public.friendships f1 ON (
    (f1.user_id = user_a AND f1.friend_id = u.id) OR
    (f1.friend_id = user_a AND f1.user_id = u.id)
  )
  INNER JOIN public.friendships f2 ON (
    (f2.user_id = user_b AND f2.friend_id = u.id) OR
    (f2.friend_id = user_b AND f2.user_id = u.id)
  )
  WHERE f1.status = 'accepted'
  AND f2.status = 'accepted'
  AND u.id NOT IN (user_a, user_b)
  AND u.is_blocked = FALSE
  ORDER BY u.first_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CREATE FUNCTION TO CHECK IF USERS ARE FRIENDS
-- ========================================

CREATE OR REPLACE FUNCTION public.are_users_friends(
  user1_id UUID,
  user2_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  friendship_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (user_id = user1_id AND friend_id = user2_id) OR
      (user_id = user2_id AND friend_id = user1_id)
    )
  ) INTO friendship_exists;

  RETURN friendship_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREATE FUNCTION TO CHECK IF USER IS BLOCKED
-- ========================================

CREATE OR REPLACE FUNCTION public.is_user_blocked(
  check_user_id UUID,
  by_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  block_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.blocked_users
    WHERE blocker_id = by_user_id AND blocked_id = check_user_id
  ) INTO block_exists;

  RETURN block_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. CREATE FUNCTION TO GET PENDING REQUEST COUNT
-- ========================================

CREATE OR REPLACE FUNCTION public.get_pending_friend_request_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO request_count
  FROM public.friendships
  WHERE friend_id = user_uuid
  AND status = 'pending';

  RETURN request_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. CREATE FUNCTION TO GET SENT REQUEST COUNT
-- ========================================

CREATE OR REPLACE FUNCTION public.get_sent_friend_request_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  request_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO request_count
  FROM public.friendships
  WHERE user_id = user_uuid
  AND status = 'pending';

  RETURN request_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. CREATE FUNCTION TO CHECK RATE LIMITS
-- ========================================

CREATE OR REPLACE FUNCTION public.can_send_friend_request(
  sender_id UUID,
  recipient_id UUID
)
RETURNS TABLE (
  can_send BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  total_pending INTEGER;
  requests_today INTEGER;
  existing_friendship BOOLEAN;
  is_blocked BOOLEAN;
  is_self BOOLEAN;
BEGIN
  -- Check if trying to friend self
  IF sender_id = recipient_id THEN
    RETURN QUERY SELECT FALSE, 'Cannot send friend request to yourself';
    RETURN;
  END IF;

  -- Check if already friends or request exists
  SELECT EXISTS(
    SELECT 1 FROM public.friendships
    WHERE (user_id = sender_id AND friend_id = recipient_id)
    OR (user_id = recipient_id AND friend_id = sender_id)
  ) INTO existing_friendship;

  IF existing_friendship THEN
    RETURN QUERY SELECT FALSE, 'Friend request already exists or you are already friends';
    RETURN;
  END IF;

  -- Check if blocked (either direction)
  SELECT EXISTS(
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = sender_id AND blocked_id = recipient_id)
    OR (blocker_id = recipient_id AND blocked_id = sender_id)
  ) INTO is_blocked;

  IF is_blocked THEN
    RETURN QUERY SELECT FALSE, 'Cannot send friend request to this user';
    RETURN;
  END IF;

  -- Check total pending requests limit (50)
  SELECT COUNT(*) INTO total_pending
  FROM public.friendships
  WHERE user_id = sender_id AND status = 'pending';

  IF total_pending >= 50 THEN
    RETURN QUERY SELECT FALSE, 'You have reached the maximum number of pending friend requests (50)';
    RETURN;
  END IF;

  -- Check daily request limit (20)
  SELECT COUNT(*) INTO requests_today
  FROM public.friendships
  WHERE user_id = sender_id
  AND status = 'pending'
  AND requested_at >= NOW() - INTERVAL '24 hours';

  IF requests_today >= 20 THEN
    RETURN QUERY SELECT FALSE, 'You have reached the daily limit of friend requests (20). Try again tomorrow.';
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT TRUE, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. CREATE FUNCTION TO EXPIRE OLD REQUESTS
-- ========================================

CREATE OR REPLACE FUNCTION public.expire_old_friend_requests()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.friendships
    WHERE status = 'pending'
    AND requested_at < NOW() - INTERVAL '30 days'
    RETURNING *
  )
  SELECT COUNT(*) INTO expired_count FROM deleted;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. ENABLE REALTIME FOR FRIENDSHIPS TABLE
-- ========================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- 13. CREATE INDEXES FOR COMMON QUERIES
-- ========================================

-- Index for finding friends of a specific user
CREATE INDEX IF NOT EXISTS idx_friendships_user_accepted
ON public.friendships(user_id) WHERE status = 'accepted';

CREATE INDEX IF NOT EXISTS idx_friendships_friend_accepted
ON public.friendships(friend_id) WHERE status = 'accepted';

-- 14. UPDATE UPDATED_AT TRIGGER FOR FRIENDSHIPS
-- ========================================

CREATE OR REPLACE FUNCTION public.update_friendships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_friendships_timestamp ON public.friendships;
CREATE TRIGGER trigger_update_friendships_timestamp
BEFORE UPDATE ON public.friendships
FOR EACH ROW EXECUTE FUNCTION public.update_friendships_updated_at();

-- 15. INITIALIZE FRIEND_COUNT FOR EXISTING USERS
-- ========================================

UPDATE public.users
SET friend_count = (
  SELECT COUNT(DISTINCT
    CASE
      WHEN f.user_id = users.id THEN f.friend_id
      WHEN f.friend_id = users.id THEN f.user_id
    END
  )
  FROM public.friendships f
  WHERE (f.user_id = users.id OR f.friend_id = users.id)
  AND f.status = 'accepted'
)
WHERE friend_count = 0;

-- ========================================
-- END OF MIGRATION
-- ========================================

-- Summary:
-- ✅ friendships table created with proper constraints and indexes
-- ✅ blocked_users table created with proper constraints and indexes
-- ✅ friend_count column added to users table
-- ✅ Trigger function to auto-update friend counts
-- ✅ get_mutual_friends() function for finding common friends
-- ✅ are_users_friends() helper function
-- ✅ is_user_blocked() helper function
-- ✅ Rate limiting functions (50 pending max, 20 per day)
-- ✅ Request expiration function (30 days)
-- ✅ RLS policies for security
-- ✅ Real-time enabled for live updates
-- ✅ Performance indexes for common queries
