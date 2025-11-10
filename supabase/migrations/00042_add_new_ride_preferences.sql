-- Migration: Add New Ride Preferences and Features
-- Created: 2025-11-10
-- Purpose: Add new trip preferences, payment options, and ride reporting features

-- ============================================================================
-- RIDES TABLE - Add new preference fields
-- ============================================================================

-- Add talkativeness level
DO $$ BEGIN
  CREATE TYPE talkativeness_level AS ENUM ('silent', 'low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.rides
ADD COLUMN IF NOT EXISTS talkativeness talkativeness_level DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS eating_allowed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS luggage_space_description text,
ADD COLUMN IF NOT EXISTS payment_method text CHECK (payment_method IN ('swish', 'cash', 'both'));

COMMENT ON COLUMN public.rides.talkativeness IS 'How talkative the driver prefers passengers to be during the ride';
COMMENT ON COLUMN public.rides.eating_allowed IS 'Whether eating is allowed during the ride';
COMMENT ON COLUMN public.rides.luggage_space_description IS 'Description of available luggage space';
COMMENT ON COLUMN public.rides.payment_method IS 'Accepted payment method(s): swish, cash, or both';

-- ============================================================================
-- RIDE_REPORTS TABLE - For reporting problematic rides
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ride_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN (
    'no_show',
    'late_arrival',
    'unsafe_driving',
    'inappropriate_behavior',
    'vehicle_condition',
    'route_change',
    'harassment',
    'other'
  )),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,

  -- Ensure user was part of the ride (driver or approved rider)
  CONSTRAINT reporter_participated CHECK (
    reporter_id IN (
      SELECT driver_id FROM public.rides WHERE id = ride_id
      UNION
      SELECT rider_id FROM public.booking_requests
      WHERE ride_id = ride_reports.ride_id AND status = 'approved'
    )
  )
);

COMMENT ON TABLE public.ride_reports IS 'Reports submitted by ride participants about issues during trips';

-- Enable RLS
ALTER TABLE public.ride_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ride_reports
CREATE POLICY "Users can view their own reports"
  ON public.ride_reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

CREATE POLICY "Participants can create ride reports"
  ON public.ride_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON public.ride_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update reports"
  ON public.ride_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ============================================================================
-- BOOKING_REQUESTS TABLE - Add expiration tracking
-- ============================================================================

ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT (now() + interval '24 hours'),
ADD COLUMN IF NOT EXISTS expired boolean DEFAULT false;

COMMENT ON COLUMN public.booking_requests.expires_at IS 'When this booking request expires if not responded to';
COMMENT ON COLUMN public.booking_requests.expired IS 'Whether this request has expired';

-- Create index for expired requests
CREATE INDEX IF NOT EXISTS idx_booking_requests_expired
  ON public.booking_requests(expires_at)
  WHERE status = 'pending' AND expired = false;

-- ============================================================================
-- USER_BEHAVIOR_TRACKING TABLE - Track no-shows and lateness
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_behavior_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ride_id uuid NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  incident_type text NOT NULL CHECK (incident_type IN ('no_show', 'late', 'cancelled_late')),
  incident_date timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.user_behavior_tracking IS 'Tracks user behavior incidents (no-shows, lateness) for enforcement';

-- Enable RLS
ALTER TABLE public.user_behavior_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own behavior tracking"
  ON public.user_behavior_tracking
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all behavior tracking"
  ON public.user_behavior_tracking
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- ============================================================================
-- USERS TABLE - Add username and social verification
-- ============================================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS facebook_profile_url text,
ADD COLUMN IF NOT EXISTS instagram_profile_url text,
ADD COLUMN IF NOT EXISTS social_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS spotify_user_id text,
ADD COLUMN IF NOT EXISTS spotify_refresh_token text;

-- Username constraints
ALTER TABLE public.users
ADD CONSTRAINT username_format CHECK (
  username IS NULL OR (
    length(username) >= 3 AND
    length(username) <= 30 AND
    username ~ '^[a-zA-Z0-9_]+$'
  )
);

COMMENT ON COLUMN public.users.username IS 'Unique username for user discovery and search';
COMMENT ON COLUMN public.users.facebook_profile_url IS 'Connected Facebook profile URL';
COMMENT ON COLUMN public.users.instagram_profile_url IS 'Connected Instagram profile URL';
COMMENT ON COLUMN public.users.social_verified IS 'Whether user has connected at least one social media account';
COMMENT ON COLUMN public.users.spotify_user_id IS 'Spotify user ID for playlist integration';
COMMENT ON COLUMN public.users.spotify_refresh_token IS 'Encrypted Spotify refresh token';

-- Create index for username search
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_search ON public.users USING gin(
  to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(username, ''))
);

-- ============================================================================
-- RIDE_PLAYLISTS TABLE - Spotify collaborative playlists per ride
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ride_playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  spotify_playlist_id text NOT NULL,
  spotify_playlist_url text NOT NULL,
  is_collaborative boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),

  UNIQUE(ride_id)
);

COMMENT ON TABLE public.ride_playlists IS 'Spotify collaborative playlists linked to rides';

-- Enable RLS
ALTER TABLE public.ride_playlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view ride playlists"
  ON public.ride_playlists
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Drivers can create playlists for their rides"
  ON public.ride_playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.rides WHERE id = ride_id AND driver_id = auth.uid())
  );

CREATE POLICY "Drivers can delete their ride playlists"
  ON public.ride_playlists
  FOR DELETE
  TO authenticated
  USING (driver_id = auth.uid());

-- ============================================================================
-- Update existing ride_alerts table for enhanced proximity matching
-- ============================================================================

ALTER TABLE public.ride_alerts
ADD COLUMN IF NOT EXISTS departure_time_start time,
ADD COLUMN IF NOT EXISTS departure_time_end time,
ADD COLUMN IF NOT EXISTS days_of_week integer[] CHECK (
  days_of_week IS NULL OR (
    array_length(days_of_week, 1) > 0 AND
    days_of_week <@ ARRAY[0,1,2,3,4,5,6]
  )
);

COMMENT ON COLUMN public.ride_alerts.departure_time_start IS 'Optional: earliest departure time for matching rides';
COMMENT ON COLUMN public.ride_alerts.departure_time_end IS 'Optional: latest departure time for matching rides';
COMMENT ON COLUMN public.ride_alerts.days_of_week IS 'Optional: days of week (0=Sunday, 6=Saturday) for matching';

-- ============================================================================
-- Add indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rides_departure_time ON public.rides(departure_time) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_rides_preferences ON public.rides(female_only, pets_allowed, smoking_allowed);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status_created ON public.booking_requests(status, created_at);
