import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase-server'
import { User as UserIcon, Star, Car, MapPin } from 'lucide-react'

interface ProfilePageProps {
  params: { id: string }
}

type ProfileData = {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  bio: string | null
  languages: string[] | null
  trust_score: number | null
  total_rides_driver: number | null
  total_rides_rider: number | null
  photo_url: string | null
}

type VehicleData = {
  id: string
  brand: string | null
  model: string | null
  color: string | null
  year: number | null
  seats: number | null
  is_primary: boolean | null
}

type RatingData = {
  rating: number
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient()

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select(
      `id, first_name, last_name, full_name, bio, languages, trust_score, total_rides_driver, total_rides_rider, photo_url`
    )
    .eq('id', params.id)
    .maybeSingle()

  if (profileError) {
    console.error('Failed to load profile', profileError)
  }

  if (!profile) {
    notFound()
  }

  // Type assertion after null check
  const userProfile = profile as ProfileData

  const { data: vehiclesData } = await supabase
    .from('vehicles')
    .select('id, brand, model, color, year, seats, is_primary')
    .eq('user_id', params.id)
    .order('is_primary', { ascending: false })

  const vehicles = (vehiclesData || []) as VehicleData[]

  const { data: ratingsData } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', params.id)

  const ratings = (ratingsData || []) as RatingData[]

  const averageRating = ratings && ratings.length > 0
    ? Number(
        (
          ratings.reduce((sum: number, current: { rating: number }) => sum + (current.rating ?? 5), 0) /
          ratings.length
        ).toFixed(2)
      )
    : null

  const trustScore = averageRating !== null ? Math.round((averageRating / 5) * 100) : (userProfile.trust_score ?? 100)

  const displayName =
    [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ') || userProfile.full_name || 'Nordride user'

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center overflow-hidden">
              {userProfile.photo_url ? (
                <Image
                  src={userProfile.photo_url}
                  alt={displayName}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  sizes="64px"
                />
              ) : (
                <UserIcon className="h-8 w-8" />
              )}
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold">{displayName}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                {averageRating ? `${averageRating.toFixed(1)} / 5` : 'No ratings yet'}
                <span className="text-xs text-gray-400">
                  ({trustScore === 0 || !averageRating ? '–' : trustScore} trust score)
                </span>
              </p>
            </div>
          </div>

          {userProfile.bio && (
            <p className="text-lg text-gray-700 leading-relaxed">{userProfile.bio}</p>
          )}

          {userProfile.languages && userProfile.languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {userProfile.languages.map((language: string) => (
                <span
                  key={language}
                  className="px-3 py-1 bg-black text-white rounded-full text-xs uppercase tracking-wide"
                >
                  {language}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 md:col-span-1">
            <h2 className="font-display text-2xl font-bold mb-4">Ride statistics</h2>
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-gray-600">As driver</p>
                <p className="text-2xl font-bold text-green-700">{userProfile.total_rides_driver ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-gray-600">As rider</p>
                <p className="text-2xl font-bold text-blue-700">{userProfile.total_rides_rider ?? 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5" />
              <h2 className="font-display text-2xl font-bold">Vehicles</h2>
            </div>

            {!vehicles || vehicles.length === 0 ? (
              <p className="text-gray-600">No vehicles shared yet.</p>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="p-4 border rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {vehicle.color ?? 'Color not shared'} • {vehicle.year ?? 'Year not shared'} • {vehicle.seats} seats
                        </p>
                      </div>
                      {vehicle.is_primary && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
