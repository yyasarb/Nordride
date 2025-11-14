import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase-server'
import { User as UserIcon, Users, MessageSquare, Star, Music, Facebook, Instagram } from 'lucide-react'
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
  profile_picture_url: string | null
  verification_tier: number | null
  friend_count: number | null
  facebook_profile_url: string | null
  instagram_profile_url: string | null
  spotify_connected: boolean | null
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
      `id, first_name, last_name, full_name, bio, languages, total_rides_driver, total_rides_rider, photo_url, profile_picture_url, verification_tier, friend_count, facebook_profile_url, instagram_profile_url, spotify_connected`
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

  // Get mutual friends count if viewer is logged in
  let mutualFriendsCount = 0
  if (currentUser && currentUser.id !== params.id) {
    try {
      const { data: mutualData } = await supabase
        .rpc('get_mutual_friends_count', {
          user_id_1: currentUser.id,
          user_id_2: params.id
        } as any)

      mutualFriendsCount = typeof mutualData === 'number' ? mutualData : 0
    } catch (error) {
      console.error('Error fetching mutual friends:', error)
    }
  }

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
      <div className="container mx-auto px-4 py-12 max-w-[1100px] space-y-6">

        {/* Header: Avatar, Name, Badge */}
        <Card className="p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden flex-shrink-0">
              {(userProfile.photo_url || userProfile.profile_picture_url) ? (
                <Image
                  src={userProfile.photo_url || userProfile.profile_picture_url || ''}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{displayName}</h1>
                {userProfile.verification_tier && userProfile.verification_tier >= 1 && (
                  <VerificationBadge
                    tier={userProfile.verification_tier as 1 | 2 | 3}
                    size="lg"
                    showTooltip
                  />
                )}
              </div>

              {/* Social Media Icons */}
              {(userProfile.facebook_profile_url || userProfile.instagram_profile_url || userProfile.spotify_connected) && (
                <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                  {userProfile.facebook_profile_url && (
                    <a
                      href={userProfile.facebook_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                      title="Facebook"
                      aria-label="Facebook profile"
                    >
                      <Facebook className="h-3.5 w-3.5 text-white" />
                    </a>
                  )}
                  {userProfile.instagram_profile_url && (
                    <a
                      href={userProfile.instagram_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                      title="Instagram"
                      aria-label="Instagram profile"
                    >
                      <Instagram className="h-3.5 w-3.5 text-white" />
                    </a>
                  )}
                  {userProfile.spotify_connected && (
                    <div
                      className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center"
                      title="Spotify Connected"
                      aria-label="Spotify connected"
                    >
                      <Music className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons - Only show if not viewing own profile */}
              {!isOwnProfile && currentUser && (
                <div className="flex gap-3 justify-center md:justify-start mt-4">
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
            </div>
          </div>

          {userProfile.bio && (
            <p className="text-gray-700 leading-relaxed mt-4">{userProfile.bio}</p>
          )}

          {userProfile.languages && userProfile.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {userProfile.languages.map((language: string) => (
                <span
                  key={language}
                  className="px-3 py-1 bg-black text-white rounded-xl text-xs"
                >
                  {language}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Social Summary Row */}
        <Card className="p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            {/* Friends Count */}
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{userProfile.friend_count ?? 0}</p>
                <p className="text-sm text-gray-600">Friends</p>
              </div>
            </div>

            {/* Common Friends (only show if > 0) */}
            {mutualFriendsCount > 0 && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold">{mutualFriendsCount}</p>
                  <p className="text-sm text-gray-600">Common friends</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Ride Statistics */}
        <Card className="p-6 shadow-sm">
          <h2 className="font-semibold text-lg mb-4">Ride statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <p className="text-sm text-gray-600 mb-1">As driver</p>
              <p className="text-3xl font-bold text-green-700">{userProfile.total_rides_driver ?? 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">As rider</p>
              <p className="text-3xl font-bold text-blue-700">{userProfile.total_rides_rider ?? 0}</p>
            </div>
          </div>
        </Card>

        {/* Reviews Section */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-semibold text-lg">Reviews</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Link
                      href={`/profile/${review.reviewer?.id}`}
                      className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
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
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/profile/${review.reviewer?.id}`}
                              className="font-semibold hover:underline"
                            >
                              {getReviewerName(review.reviewer)}
                            </Link>
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
                            <p className="text-sm text-gray-600 truncate">
                              {review.ride.origin_address} → {review.ride.destination_address}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 flex-shrink-0">
                          {formatDate(review.ride?.departure_time || review.created_at)}
                        </p>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{review.text}</p>
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
