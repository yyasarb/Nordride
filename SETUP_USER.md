# Setup User & Sample Data

## Step 1: Create User in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** button
4. Fill in:
   - **Email**: `yasinbyl@gmail.com`
   - **Password**: `password123`
   - **Auto Confirm User**: ✅ (check this box)
5. Click **"Create user"**

## Step 2: Run SQL to Create Profile & Sample Data

After creating the user above, copy the SQL from `scripts/create-user.sql` and run it in:
**Supabase Dashboard** → **SQL Editor** → **New Query**

Or run this directly:

```sql
DO $$
DECLARE
  user_uuid UUID;
  vehicle_uuid UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO user_uuid FROM auth.users WHERE email = 'yasinbyl@gmail.com';

  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'User not found. Create user in Auth first!';
  END IF;

  -- Create profile
  INSERT INTO users (id, email, full_name, bio, phone, languages, email_verified, phone_verified, trust_score, total_rides_driver, total_rides_rider)
  VALUES (
    user_uuid, 'yasinbyl@gmail.com', 'John Doe',
    'Software engineer, 36 years old. Regular commuter Malmö-Stockholm.',
    '+46 70 123 4567', ARRAY['English', 'Swedish'],
    true, true, 95, 12, 8
  ) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

  -- Create vehicle
  INSERT INTO vehicles (user_id, brand, model, color, year, plate_number, seats, is_primary)
  VALUES (user_uuid, 'Volvo', 'V60', 'Silver', 2021, 'ABC123', 4, true)
  ON CONFLICT (user_id, plate_number) DO NOTHING
  RETURNING id INTO vehicle_uuid;

  IF vehicle_uuid IS NULL THEN
    SELECT id INTO vehicle_uuid FROM vehicles WHERE user_id = user_uuid LIMIT 1;
  END IF;

  -- Create rides
  INSERT INTO rides (
    driver_id, vehicle_id,
    origin_address, origin_coords,
    destination_address, destination_coords,
    route_polyline, route_km, departure_time,
    seats_available, suggested_total_cost, status
  ) VALUES
    (user_uuid, vehicle_uuid,
     'Malmö Central, Sweden', ST_SetSRID(ST_MakePoint(13.00073, 55.60911), 4326)::geography,
     'Stockholm Central, Sweden', ST_SetSRID(ST_MakePoint(18.05829, 59.33022), 4326)::geography,
     'route', 618.5, '2025-11-12 09:00:00+01', 3, 800, 'published'),
    (user_uuid, vehicle_uuid,
     'Stockholm Central, Sweden', ST_SetSRID(ST_MakePoint(18.05829, 59.33022), 4326)::geography,
     'Malmö Central, Sweden', ST_SetSRID(ST_MakePoint(13.00073, 55.60911), 4326)::geography,
     'route', 618.5, '2025-11-16 15:00:00+01', 3, 800, 'published');

  RAISE NOTICE 'Setup complete!';
END $$;
```

## Step 3: Login & Test

**Login credentials:**
- Email: `yasinbyl@gmail.com`
- Password: `password123`

**Test the features:**
1. Go to http://localhost:3000
2. Click "Find a ride"
3. Try autocomplete by typing "Sto..." (should show Stockholm suggestions)
4. Click "Show all rides" to see the sample trips

## What's Been Created:

✅ **User Profile**: John Doe, 36 years old
✅ **Vehicle**: Volvo V60 (2021, Silver)
✅ **Trip 1**: Malmö → Stockholm (Nov 12, 2025, 9:00 AM)
✅ **Trip 2**: Stockholm → Malmö (Nov 16, 2025, 3:00 PM)

Both trips have 3 available seats at 800 SEK total cost.
