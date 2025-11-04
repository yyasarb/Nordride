// Script to seed the database with sample data
// Run with: npx tsx scripts/seed.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // 1. Create sample user (John Doe, 36 years old)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'john.doe@nordride.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        full_name: 'John Doe',
        age: 36
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      // If user already exists, try to get it
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users.find(u => u.email === 'john.doe@nordride.com')

      if (!existingUser) throw authError

      console.log('✅ Using existing user')
      var userId = existingUser.id
    } else {
      var userId = authUser.user.id
      console.log('✅ Created auth user')
    }

    // 2. Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'john.doe@nordride.com',
        full_name: 'John Doe',
        bio: 'Software engineer from Stockholm. Love traveling and meeting new people. Regular commuter between Malmö and Stockholm.',
        phone: '+46 70 123 4567',
        languages: ['English', 'Swedish'],
        email_verified: true,
        phone_verified: true,
        trust_score: 95,
        total_rides_driver: 12,
        total_rides_rider: 8
      })

    if (profileError) console.error('Error creating profile:', profileError)
    else console.log('✅ Created user profile')

    // 3. Create vehicle
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert({
        user_id: userId,
        brand: 'Volvo',
        model: 'V60',
        color: 'Silver',
        year: 2021,
        plate_number: 'ABC123',
        seats: 4,
        smoking_policy: 'no_smoking',
        music_preference: 'normal',
        luggage_capacity: ['carry_on', 'large'],
        pets_allowed: false,
        is_primary: true
      })
      .select()
      .single()

    if (vehicleError) console.error('Error creating vehicle:', vehicleError)
    else console.log('✅ Created vehicle')

    const vehicleId = vehicle?.id

    // 4. Create rides (Malmö to Stockholm, Nov 12-16, 2025)
    const rides = [
      {
        // One-way: Malmö → Stockholm (Nov 12)
        driver_id: userId,
        vehicle_id: vehicleId,
        origin_address: 'Malmö Central Station, Malmö, Sweden',
        origin_coords: `POINT(13.00073 55.60911)`,
        destination_address: 'Stockholm Central Station, Stockholm, Sweden',
        destination_coords: `POINT(18.05829 59.33022)`,
        route_polyline: 'encoded_polyline_here',
        route_km: 618.5,
        departure_time: '2025-11-12T09:00:00+01:00',
        seats_available: 3,
        seats_booked: 0,
        suggested_total_cost: 800,
        pets_allowed: false,
        smoking_allowed: false,
        music_preference: 'normal',
        luggage_capacity: ['carry_on', 'large'],
        route_description: 'Direct route via E4. Will stop for coffee break in Jönköping.',
        status: 'published'
      },
      {
        // Return: Stockholm → Malmö (Nov 16)
        driver_id: userId,
        vehicle_id: vehicleId,
        origin_address: 'Stockholm Central Station, Stockholm, Sweden',
        origin_coords: `POINT(18.05829 59.33022)`,
        destination_address: 'Malmö Central Station, Malmö, Sweden',
        destination_coords: `POINT(13.00073 55.60911)`,
        route_polyline: 'encoded_polyline_here',
        route_km: 618.5,
        departure_time: '2025-11-16T15:00:00+01:00',
        seats_available: 3,
        seats_booked: 0,
        suggested_total_cost: 800,
        pets_allowed: false,
        smoking_allowed: false,
        music_preference: 'normal',
        luggage_capacity: ['carry_on', 'large'],
        route_description: 'Return trip via E4. Flexible with departure time.',
        status: 'published'
      }
    ]

    for (const ride of rides) {
      const { error: rideError } = await supabase
        .from('rides')
        .insert(ride)

      if (rideError) console.error('Error creating ride:', rideError)
      else console.log('✅ Created ride:', ride.origin_address, '→', ride.destination_address)
    }

    console.log('\n🎉 Database seeded successfully!')
    console.log('\n📧 Login credentials:')
    console.log('Email: john.doe@nordride.com')
    console.log('Password: password123')

  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  }
}

seed()
