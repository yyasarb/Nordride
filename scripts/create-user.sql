-- Step 1: First create the auth user in Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Email: yasinbyl@gmail.com
-- Password: password123
-- Then run this SQL:

-- Step 2: Create user profile (replace USER_ID with the actual UUID from auth.users)
DO $$
DECLARE
  user_uuid UUID;
  vehicle_uuid UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'yasinbyl@gmail.com';

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User not found in auth.users. Please create the user in Supabase Dashboard first.';
  END IF;

  -- Create user profile
  INSERT INTO users (id, email, full_name, bio, phone, languages, email_verified, phone_verified, trust_score, total_rides_driver, total_rides_rider)
  VALUES (
    user_uuid,
    'yasinbyl@gmail.com',
    'John Doe',
    'Software engineer, 36 years old from Stockholm. Love traveling and meeting new people. Regular commuter between Malmö and Stockholm.',
    '+46 70 123 4567',
    ARRAY['English', 'Swedish'],
    true,
    true,
    95,
    12,
    8
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    bio = EXCLUDED.bio;

  RAISE NOTICE 'Created user profile for %', user_uuid;

  -- Create vehicle
  INSERT INTO vehicles (user_id, brand, model, color, year, plate_number, seats, smoking_policy, music_preference, luggage_capacity, pets_allowed, is_primary)
  VALUES (
    user_uuid,
    'Volvo',
    'V60',
    'Silver',
    2021,
    'ABC123',
    4,
    'no_smoking',
    'normal',
    ARRAY['carry_on'::luggage_size, 'large'::luggage_size],
    false,
    true
  )
  ON CONFLICT (user_id, plate_number) DO NOTHING
  RETURNING id INTO vehicle_uuid;

  RAISE NOTICE 'Created vehicle %', vehicle_uuid;

  -- If vehicle already exists, get it
  IF vehicle_uuid IS NULL THEN
    SELECT id INTO vehicle_uuid FROM vehicles WHERE user_id = user_uuid LIMIT 1;
  END IF;

  -- Create rides (Malmö ↔ Stockholm, Nov 12-16, 2025)
  INSERT INTO rides (
    driver_id, vehicle_id,
    origin_address, origin_coords,
    destination_address, destination_coords,
    route_polyline, route_km,
    departure_time, seats_available, seats_booked,
    suggested_total_cost,
    pets_allowed, smoking_allowed,
    music_preference, luggage_capacity,
    route_description, status
  )
  VALUES
    -- One-way: Malmö → Stockholm (Nov 12, 9 AM)
    (
      user_uuid, vehicle_uuid,
      'Malmö Central Station, Malmö, Sweden',
      ST_SetSRID(ST_MakePoint(13.00073, 55.60911), 4326)::geography,
      'Stockholm Central Station, Stockholm, Sweden',
      ST_SetSRID(ST_MakePoint(18.05829, 59.33022), 4326)::geography,
      'encoded_route', 618.5,
      '2025-11-12 09:00:00+01', 3, 0,
      800,
      false, false,
      'normal', ARRAY['carry_on'::luggage_size, 'large'::luggage_size],
      'Direct route via E4. Will stop for coffee break in Jönköping.',
      'published'
    ),
    -- Return: Stockholm → Malmö (Nov 16, 3 PM)
    (
      user_uuid, vehicle_uuid,
      'Stockholm Central Station, Stockholm, Sweden',
      ST_SetSRID(ST_MakePoint(18.05829, 59.33022), 4326)::geography,
      'Malmö Central Station, Malmö, Sweden',
      ST_SetSRID(ST_MakePoint(13.00073, 55.60911), 4326)::geography,
      'encoded_route', 618.5,
      '2025-11-16 15:00:00+01', 3, 0,
      800,
      false, false,
      'normal', ARRAY['carry_on'::luggage_size, 'large'::luggage_size],
      'Return trip via E4. Flexible with departure time.',
      'published'
    );

  RAISE NOTICE 'Created 2 rides';

  RAISE NOTICE 'Setup complete!';
  RAISE NOTICE 'Login: yasinbyl@gmail.com / password123';

END $$;
