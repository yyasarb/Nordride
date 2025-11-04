-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE ride_status AS ENUM ('draft', 'published', 'confirmed', 'departed', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'declined', 'cancelled');
CREATE TYPE luggage_size AS ENUM ('small', 'carry_on', 'large');
CREATE TYPE music_preference AS ENUM ('no_music', 'quiet', 'normal', 'party');
CREATE TYPE smoking_policy AS ENUM ('no_smoking', 'smoking_allowed', 'outside_only');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    phone TEXT,
    languages TEXT[] DEFAULT ARRAY['English'],
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    trust_score INTEGER DEFAULT 100,
    total_rides_driver INTEGER DEFAULT 0,
    total_rides_rider INTEGER DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT,
    color TEXT,
    year INTEGER,
    plate_number TEXT NOT NULL,
    plate_number_encrypted TEXT,
    seats INTEGER NOT NULL CHECK (seats >= 1 AND seats <= 8),
    smoking_policy smoking_policy NOT NULL DEFAULT 'no_smoking',
    music_preference music_preference NOT NULL DEFAULT 'normal',
    luggage_capacity luggage_size[] DEFAULT ARRAY['small', 'carry_on'],
    pets_allowed BOOLEAN DEFAULT FALSE,
    accessibility_features TEXT[],
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, plate_number)
);

-- Rides table
CREATE TABLE public.rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    origin_address TEXT NOT NULL,
    origin_coords GEOGRAPHY(Point, 4326) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_coords GEOGRAPHY(Point, 4326) NOT NULL,
    route_polyline TEXT NOT NULL,
    route_km DECIMAL(10, 2) NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    seats_available INTEGER NOT NULL CHECK (seats_available >= 1 AND seats_available <= 8),
    seats_booked INTEGER DEFAULT 0,
    suggested_total_cost INTEGER NOT NULL,
    custom_total_cost INTEGER,
    final_rider_count INTEGER DEFAULT 0,
    pets_allowed BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    music_preference music_preference NOT NULL DEFAULT 'normal',
    luggage_capacity luggage_size[] DEFAULT ARRAY['small', 'carry_on'],
    route_description TEXT,
    accessibility_notes TEXT,
    status ride_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CONSTRAINT valid_seats CHECK (seats_booked <= seats_available),
    CONSTRAINT valid_departure CHECK (departure_time > NOW())
);

-- Create spatial index for route searching
CREATE INDEX idx_rides_origin ON rides USING GIST (origin_coords);
CREATE INDEX idx_rides_destination ON rides USING GIST (destination_coords);
CREATE INDEX idx_rides_departure ON rides (departure_time) WHERE status = 'published';
CREATE INDEX idx_rides_status ON rides (status);

-- Booking requests table
CREATE TABLE public.booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seats_requested INTEGER NOT NULL DEFAULT 1 CHECK (seats_requested >= 1 AND seats_requested <= 4),
    message TEXT,
    pickup_address TEXT,
    pickup_coords GEOGRAPHY(Point, 4326),
    dropoff_address TEXT,
    dropoff_coords GEOGRAPHY(Point, 4326),
    status booking_status NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ride_id, rider_id)
);

-- Message threads table
CREATE TABLE public.message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ride_id)
);

-- Messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(text) <= 500),
    is_visible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ride_id, reviewer_id, reviewee_id),
    CONSTRAINT different_users CHECK (reviewer_id != reviewee_id)
);

-- Reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ride_id UUID REFERENCES public.rides(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
    action_taken TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    CONSTRAINT different_users CHECK (reporter_id != reported_user_id)
);

-- Trip completion table
CREATE TABLE public.trip_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
    rider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    marked_by TEXT CHECK (marked_by IN ('rider', 'driver', 'system')),
    auto_marked BOOLEAN DEFAULT FALSE,
    marked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ride_id, rider_id)
);

-- Notifications table (for tracking email sends)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    metadata JSONB,
    sent_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create views for easier querying

-- View for ride costs calculation
CREATE VIEW ride_costs AS
SELECT 
    r.id,
    r.route_km,
    COALESCE(r.custom_total_cost, r.suggested_total_cost) as total_cost,
    (r.final_rider_count + 1) as total_people,
    ROUND(
        COALESCE(r.custom_total_cost, r.suggested_total_cost)::NUMERIC / 
        NULLIF(r.final_rider_count + 1, 0)
    ) as cost_per_person
FROM rides r;

-- View for upcoming rides with full details
CREATE VIEW upcoming_rides AS
SELECT 
    r.*,
    u.full_name as driver_name,
    u.photo_url as driver_photo,
    u.trust_score as driver_trust_score,
    v.brand as vehicle_brand,
    v.model as vehicle_model,
    (r.seats_available - r.seats_booked) as seats_remaining
FROM rides r
JOIN users u ON r.driver_id = u.id
JOIN vehicles v ON r.vehicle_id = v.id
WHERE r.departure_time > NOW()
    AND r.status = 'published'
ORDER BY r.departure_time ASC;

-- Row Level Security (RLS) Policies

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Vehicles policies
CREATE POLICY "Users can view all vehicles" ON public.vehicles
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own vehicles" ON public.vehicles
    FOR ALL USING (auth.uid() = user_id);

-- Rides policies
CREATE POLICY "Anyone can view published rides" ON public.rides
    FOR SELECT USING (status IN ('published', 'confirmed', 'departed', 'completed'));

CREATE POLICY "Drivers can manage own rides" ON public.rides
    FOR ALL USING (auth.uid() = driver_id);

-- Booking policies
CREATE POLICY "Users can view own bookings" ON public.booking_requests
    FOR SELECT USING (auth.uid() IN (rider_id, (SELECT driver_id FROM rides WHERE id = ride_id)));

CREATE POLICY "Riders can create bookings" ON public.booking_requests
    FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Users can update own bookings" ON public.booking_requests
    FOR UPDATE USING (
        auth.uid() = rider_id OR 
        auth.uid() = (SELECT driver_id FROM rides WHERE id = ride_id)
    );

-- Messages policies
CREATE POLICY "Users can view messages for their rides" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM message_threads mt
            JOIN rides r ON mt.ride_id = r.id
            JOIN booking_requests br ON br.ride_id = r.id
            WHERE mt.id = thread_id
            AND (
                auth.uid() = r.driver_id OR 
                (auth.uid() = br.rider_id AND br.status = 'approved')
            )
        )
    );

CREATE POLICY "Users can send messages in their threads" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM message_threads mt
            JOIN rides r ON mt.ride_id = r.id
            JOIN booking_requests br ON br.ride_id = r.id
            WHERE mt.id = thread_id
            AND (
                auth.uid() = r.driver_id OR 
                (auth.uid() = br.rider_id AND br.status = 'approved')
            )
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view visible reviews" ON public.reviews
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Users can create reviews for completed rides" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = reviewer_id AND
        EXISTS (
            SELECT 1 FROM rides r
            WHERE r.id = ride_id
            AND r.status = 'completed'
            AND (
                auth.uid() = r.driver_id OR
                EXISTS (
                    SELECT 1 FROM booking_requests br
                    WHERE br.ride_id = r.id
                    AND br.rider_id = auth.uid()
                    AND br.status = 'approved'
                )
            )
        )
    );

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_booking_requests_updated_at BEFORE UPDATE ON public.booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update ride seats when booking is approved
CREATE OR REPLACE FUNCTION update_ride_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE rides
        SET seats_booked = seats_booked + NEW.seats_requested,
            final_rider_count = final_rider_count + NEW.seats_requested
        WHERE id = NEW.ride_id;
    ELSIF NEW.status IN ('declined', 'cancelled') AND OLD.status = 'approved' THEN
        UPDATE rides
        SET seats_booked = seats_booked - NEW.seats_requested,
            final_rider_count = final_rider_count - NEW.seats_requested
        WHERE id = NEW.ride_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ride_seats_trigger
    AFTER UPDATE OF status ON public.booking_requests
    FOR EACH ROW EXECUTE FUNCTION update_ride_seats();

-- Function to create message thread when ride is created
CREATE OR REPLACE FUNCTION create_message_thread()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO message_threads (ride_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_message_thread_trigger
    AFTER INSERT ON public.rides
    FOR EACH ROW EXECUTE FUNCTION create_message_thread();

-- Function to auto-reveal reviews after 14 days
CREATE OR REPLACE FUNCTION auto_reveal_reviews()
RETURNS void AS $$
BEGIN
    UPDATE reviews
    SET is_visible = true
    WHERE is_visible = false
    AND created_at < NOW() - INTERVAL '14 days';
END;
$$ language 'plpgsql';

-- Function for searching rides (the main matching algorithm)
CREATE OR REPLACE FUNCTION search_rides(
    start_lng FLOAT,
    start_lat FLOAT,
    end_lng FLOAT,
    end_lat FLOAT,
    max_distance_meters INTEGER DEFAULT 50000
)
RETURNS TABLE (
    ride_id UUID,
    driver_id UUID,
    driver_name TEXT,
    origin_address TEXT,
    destination_address TEXT,
    departure_time TIMESTAMPTZ,
    route_km DECIMAL,
    seats_available INTEGER,
    seats_remaining INTEGER,
    cost_per_person INTEGER,
    pets_allowed BOOLEAN,
    smoking_allowed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH rider_points AS (
        SELECT
            ST_SetSRID(ST_MakePoint(start_lng, start_lat), 4326)::geography AS start_pt,
            ST_SetSRID(ST_MakePoint(end_lng, end_lat), 4326)::geography AS end_pt
    )
    SELECT 
        r.id as ride_id,
        r.driver_id,
        u.full_name as driver_name,
        r.origin_address,
        r.destination_address,
        r.departure_time,
        r.route_km,
        r.seats_available,
        (r.seats_available - r.seats_booked) as seats_remaining,
        ROUND(
            COALESCE(r.custom_total_cost, r.suggested_total_cost)::NUMERIC / 
            NULLIF(r.final_rider_count + 1, 0)
        )::INTEGER as cost_per_person,
        r.pets_allowed,
        r.smoking_allowed
    FROM rides r
    CROSS JOIN rider_points rp
    JOIN users u ON r.driver_id = u.id
    WHERE r.departure_time >= NOW()
        AND r.status = 'published'
        AND (r.seats_available - r.seats_booked) > 0
        AND ST_DWithin(r.origin_coords, rp.start_pt, max_distance_meters)
        AND ST_DWithin(r.destination_coords, rp.end_pt, max_distance_meters)
    ORDER BY r.departure_time ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
