import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase-server'
import { User as UserIcon, Car, MapPin, MessageSquare, Star } from 'lucide-react'
import { FriendRequestButton } from '@/components/friends/friend-request-button'
import { Button } from '@/components/ui/button'
import { VerificationBadge } from '@/components/verification/verification-badge'
import Link from 'next/link'

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
  total_rides_driver: number | null
  total_rides_rider: number | null
  photo_url: string | null
  verification_tier: number | null
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

type ReviewData = {
  id: string
  text: string
  rating: number
  created_at: string
  ride_id: string
  reviewer: {
    id: string
    first_name: string | null
    last_name: string | null
    full_name: string | null
    photo_url: string | null
  }
  ride: {
    origin_address: string
    destination_address: string
    departure_time: string
  }
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const supabase = createClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const isOwnProfile = currentUser?.id === params.id

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select(
      `id, first_name, last_name, full_name, bio, languages, total_rides_driver, total_rides_rider, photo_url, verification_tier`
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

  // Fetch reviews
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select(`
      id,
      text,
      rating,
      created_at,
      ride_id,
      reviewer:users!reviews_reviewer_id_fkey(
        id,
        first_name,
        last_name,
        full_name,
        photo_url
      ),
      ride:rides!reviews_ride_id_fkey(
        origin_address,
        destination_address,
        departure_time
      )
    `)
    .eq('reviewee_id', params.id)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })

  const reviews = (reviewsData || []).map((review: any) => ({
    ...review,
    reviewer: Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer,
    ride: Array.isArray(review.ride) ? review.ride[0] : review.ride,
  })) as ReviewData[]

  const displayName =
    [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ') || userProfile.full_name || 'Nordride user'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getReviewerName = (reviewer: ReviewData['reviewer']) => {
    if (!reviewer) return 'Nordride user'
    const name = [reviewer.first_name, reviewer.last_name].filter(Boolean).join(' ')
    return name || reviewer.full_name || 'Nordride user'
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <header className="space-y-4">
          <div className="flex items-start gap-4">
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
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-4xl font-bold">{displayName}</h1>
                {userProfile.verification_tier && userProfile.verification_tier >= 1 && (
                  <VerificationBadge
                    tier={userProfile.verification_tier as 1 | 2 | 3}
                    size="lg"
                    showTooltip
                  />
                )}
              </div>
              <p className="text-gray-600">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Action buttons - Only show if not viewing own profile */}
          {!isOwnProfile && (
            <div className="flex gap-3">
              <FriendRequestButton
                userId={userProfile.id}
                userName={displayName}
                variant="default"
                size="default"
                showIcon={true}
              />
              <Button variant="outline" asChild>
                <Link href={`/messages?user=${userProfile.id}`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </Button>
            </div>
          )}

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

          {/* Verification Card */}
          <Card className="p-6 border-2 md:col-span-1">
            <h2 className="font-display text-2xl font-bold mb-4">Verification</h2>
            <div className="flex flex-col items-center justify-center py-2">
              {userProfile.verification_tier && userProfile.verification_tier >= 1 ? (
                <>
                  <VerificationBadge
                    tier={userProfile.verification_tier as 1 | 2 | 3}
                    size="lg"
                    showTooltip={false}
                  />
                  <span className="text-sm text-gray-700 font-medium mt-3">
                    {userProfile.verification_tier === 1 && 'Verified User'}
                    {userProfile.verification_tier === 2 && 'Community Verified'}
                    {userProfile.verification_tier === 3 && 'Socially Verified'}
                  </span>
                </>
              ) : (
                <p className="text-gray-500 text-sm text-center">Not verified</p>
              )}
            </div>
          </Card>

          <Card className="p-6 border-2 md:col-span-3">
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

        {/* Reviews Section */}
        <Card className="p-6 border-2">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-display text-2xl font-bold">Reviews</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No reviews yet. Complete more rides to build your reputation.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center overflow-hidden flex-shrink-0">
                      {review.reviewer?.photo_url ? (
                        <Image
                          src={review.reviewer.photo_url}
                          alt={getReviewerName(review.reviewer)}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <UserIcon className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{getReviewerName(review.reviewer)}</p>
                            {review.rating && (
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? 'fill-yellow-500 text-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {review.ride && (
                            <p className="text-sm text-gray-600">
                              {review.ride.origin_address} → {review.ride.destination_address}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(review.ride?.departure_time || review.created_at)}
                        </p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
