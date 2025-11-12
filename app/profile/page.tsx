'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Mail,
  User,
  Car as CarIcon,
  MapPin,
  Edit2,
  Camera,
  MessageSquare,
  MessageCircle,
  DollarSign,
  Users,
  Facebook,
  Instagram,
  Star,
  Music,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { VerificationBadge } from '@/components/verification/verification-badge'
import { TierProgressTracker } from '@/components/verification/tier-progress-tracker'
import { SpotifyPlaylist } from '@/components/spotify/spotify-playlist'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [stats, setStats] = useState({ ridesAsDriver: 0, ridesAsRider: 0 })
  const [reviewCount, setReviewCount] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [sekSaved, setSekSaved] = useState(0)
  const [friendCount, setFriendCount] = useState(0)
  const [friends, setFriends] = useState<any[]>([])
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [mutualFriendsCount, setMutualFriendsCount] = useState(0)

  const loadProfile = useCallback(async () => {
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      // Get user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setStats({
          ridesAsDriver: profileData.total_rides_driver || 0,
          ridesAsRider: profileData.total_rides_rider || 0
        })
        setFriendCount(profileData.friend_count || 0)
      }

      // Get vehicles
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', authUser.id)

      if (vehicleData) {
        setVehicles(vehicleData)
      }

      // Get friends
      const { data: friendsData } = await supabase
        .rpc('get_friends_with_details', { user_id_param: authUser.id })

      if (friendsData) {
        setFriends(friendsData.slice(0, 12)) // Show max 12 friends
      }

      // Get mutual friends count (for now, set to 0 - would need viewer context)
      setMutualFriendsCount(0)

      // Fetch reviews and calculate average rating
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          reviewer:reviewer_id (
            id,
            first_name,
            last_name,
            username,
            photo_url,
            profile_picture_url,
            verification_tier
          ),
          ride:ride_id (
            origin_city,
            destination_city,
            origin_country,
            destination_country
          )
        `)
        .eq('reviewee_id', authUser.id)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })

      if (reviewsData && reviewsData.length > 0) {
        setReviewCount(reviewsData.length)
        setReviews(reviewsData)
        const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0)
        setAverageRating(totalRating / reviewsData.length)
      }

      // Calculate SEK saved from completed trips
      const { data: completedRidesAsDriver } = await supabase
        .from('rides')
        .select('id, price, seats_booked')
        .eq('driver_id', authUser.id)
        .eq('completed', true)

      const { data: completedRidesAsRider } = await supabase
        .from('booking_requests')
        .select(`
          ride:rides(id, price, seats_booked, completed)
        `)
        .eq('user_id', authUser.id)
        .eq('status', 'approved')

      let totalSekSaved = 0

      // Calculate savings as driver
      if (completedRidesAsDriver) {
        completedRidesAsDriver.forEach((ride: any) => {
          const filledSeats = ride.seats_booked || 0
          if (filledSeats > 0) {
            const totalCost = ride.price || 0
            const savingsPerTrip = totalCost - (totalCost / (filledSeats + 1))
            totalSekSaved += savingsPerTrip
          }
        })
      }

      // Calculate savings as rider
      if (completedRidesAsRider) {
        completedRidesAsRider.forEach((booking: any) => {
          const ride = Array.isArray(booking.ride) ? booking.ride[0] : booking.ride
          if (ride && ride.completed) {
            const filledSeats = ride.seats_booked || 0
            if (filledSeats > 0) {
              const totalCost = ride.price || 0
              const savingsPerTrip = totalCost - (totalCost / (filledSeats + 1))
              totalSekSaved += savingsPerTrip
            }
          }
        })
      }

      setSekSaved(totalSekSaved)

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const compressImage = (file: File): Promise<Blob> => {
    const maxSize = 512
    const quality = 0.7

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          let { width, height } = img
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          } else if (height >= width && height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Image compression failed'))
                return
              }
              resolve(blob)
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = () => reject(new Error('Image load error'))
        img.src = reader.result as string
      }
      reader.onerror = () => reject(new Error('File read error'))
      reader.readAsDataURL(file)
    })
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)

    try {
      const compressed = await compressImage(file)
      const filePath = `${user.id}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, compressed, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: publicUrl, profile_picture_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile((prev: any) => (prev ? { ...prev, photo_url: publicUrl, profile_picture_url: publicUrl } : prev))
    } catch (error) {
      console.error('Avatar upload failed:', error)
    } finally {
      setAvatarUploading(false)
      event.target.value = ''
    }
  }

  const totalSeatsShared = stats.ridesAsDriver + stats.ridesAsRider

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nordride-bg">
      {/* Single-column center layout */}
      <div className="container-nordride py-10 max-w-container">

        {/* HEADER SECTION: Avatar, Name, Username, Badge */}
        <Card className="p-8 mb-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-fast">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            {/* Avatar with Edit Overlay */}
            <div className="relative group cursor-pointer flex-shrink-0 mb-4">
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
              <label htmlFor="avatar-upload" className="cursor-pointer block">
                {profile?.photo_url || profile?.profile_picture_url ? (
                  <NextImage
                    src={profile.photo_url || profile.profile_picture_url}
                    alt={[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Avatar'}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                {/* Edit overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-fast">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </label>
              {avatarUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Name and Badge */}
            <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User'}
              </h1>
              {profile?.verification_tier && (
                <VerificationBadge tier={profile.verification_tier as 1 | 2 | 3} size="lg" showTooltip />
              )}
            </div>

            {/* Username */}
            {profile?.username && (
              <p className="text-gray-500 text-sm font-medium mb-1">@{profile.username}</p>
            )}

            {/* Email */}
            <p className="text-gray-600 text-sm mt-2 flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>

            {/* Social Media Icons */}
            {(profile?.facebook_profile_url || profile?.instagram_profile_url || profile?.spotify_connected) && (
              <div className="flex items-center justify-center gap-3 mt-4">
                {profile?.facebook_profile_url && (
                  <a
                    href={profile.facebook_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="h-4 w-4 text-white" />
                  </a>
                )}
                {profile?.instagram_profile_url && (
                  <a
                    href={profile.instagram_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="h-4 w-4 text-white" />
                  </a>
                )}
                {profile?.spotify_connected && (
                  <div
                    className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center"
                    title="Spotify Connected"
                  >
                    <Music className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            {profile?.bio && (
              <div className="w-full border-t border-gray-200 my-6"></div>
            )}

            {/* Bio */}
            {profile?.bio && (
              <div className="w-full">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Divider before buttons */}
            <div className="w-full border-t border-gray-200 my-6"></div>

            {/* Action Buttons - Side by side */}
            <div className="flex gap-3">
              <Button asChild className="rounded-full bg-black text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast shadow-sm h-10 px-6 font-semibold text-sm">
                <Link href="/profile/edit" className="flex items-center justify-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-2 border-gray-300 hover:border-black hover:bg-gray-50 transition-all duration-fast h-10 px-6 font-semibold text-sm">
                <Link href={`/profile/${user?.id}`} className="flex items-center justify-center">
                  <span>View Public Profile</span>
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* QUICK INFO CARDS: Three Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Ride Statistics */}
          <Card className="p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-fast">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Ride Statistics</p>
              <div className="flex items-center justify-center gap-4">
                <div>
                  <p className="text-2xl font-bold">{stats.ridesAsDriver + stats.ridesAsRider}</p>
                  <p className="text-xs text-gray-500">Total rides</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSeatsShared}</p>
                  <p className="text-xs text-gray-500">Seats shared</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(sekSaved)}</p>
                  <p className="text-xs text-gray-500">SEK saved</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Languages I Speak */}
          <Card className="p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-fast">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-3">Languages I Speak</p>
              {profile?.languages && profile.languages.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {profile.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-xl text-xs border font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No languages added yet</p>
              )}
            </div>
          </Card>

          {/* Verification - Show highest tier achieved */}
          <Card className="p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-fast">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-3">Verification</p>
              <div className="flex flex-col items-center justify-center gap-2">
                {/* Show only the highest badge achieved */}
                {profile?.verification_tier && profile.verification_tier >= 1 && (
                  <>
                    <VerificationBadge
                      tier={profile.verification_tier as 1 | 2 | 3}
                      size="md"
                      showTooltip={false}
                    />
                    <span className="text-xs text-gray-700 font-medium">
                      {profile.verification_tier === 1 && 'Verified User'}
                      {profile.verification_tier === 2 && 'Community Verified'}
                      {profile.verification_tier === 3 && 'Socially Verified'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* TIER PROGRESS TRACKER - Only show if not fully verified */}
        {user && profile?.verification_tier !== 3 && (
          <div className="mb-6">
            <TierProgressTracker userId={user.id} onProfileUpdate={loadProfile} />
          </div>
        )}

        {/* PROFILE DETAILS: Single Column Stacked Cards */}
        <div className="space-y-6 mb-10">

          {/* My Vehicles */}
          <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-fast">
              <h3 className="font-semibold text-lg mb-3">My Vehicles</h3>
              {vehicles.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <CarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No vehicles added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-3 border rounded-xl hover:border-black transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-sm">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-gray-600">
                          {vehicle.color ? `${vehicle.color} • ` : ''}{vehicle.plate_number}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {vehicle.is_primary && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Primary
                          </span>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </Card>

          {/* Connected Accounts */}
          <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-fast">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">Connected Accounts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Facebook */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-fast ${
                profile?.facebook_profile_url
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <Facebook className={`h-6 w-6 ${
                  profile?.facebook_profile_url ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Facebook</p>
                  <p className="text-xs text-gray-600">
                    {profile?.facebook_profile_url ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {/* Instagram */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-fast ${
                profile?.instagram_profile_url
                  ? 'border-pink-200 bg-pink-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <Instagram className={`h-6 w-6 ${
                  profile?.instagram_profile_url ? 'text-pink-600' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Instagram</p>
                  <p className="text-xs text-gray-600">
                    {profile?.instagram_profile_url ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {/* Spotify */}
              <div className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-fast ${
                profile?.spotify_connected
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}>
                <Music className={`h-6 w-6 ${
                  profile?.spotify_connected ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Spotify</p>
                  <p className="text-xs text-gray-600">
                    {profile?.spotify_connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Road Playlist */}
          {user && (
            <SpotifyPlaylist
              userId={user.id}
              profile={profile}
              onUpdate={loadProfile}
              isOwnProfile={true}
            />
          )}

        </div>

        {/* REVIEWS SECTION */}
        <Card className="p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-fast">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Reviews ({reviewCount})</h3>
          </div>
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: any) => {
                const reviewer = Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer
                const ride = Array.isArray(review.ride) ? review.ride[0] : review.ride
                const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })

                return (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-4">
                      {/* Reviewer Avatar */}
                      <Link href={`/profile/${reviewer?.id}`} className="flex-shrink-0">
                        {reviewer?.photo_url || reviewer?.profile_picture_url ? (
                          <NextImage
                            src={reviewer.photo_url || reviewer.profile_picture_url}
                            alt={`${reviewer.first_name} ${reviewer.last_name}`}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </Link>

                      {/* Review Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <Link
                              href={`/profile/${reviewer?.id}`}
                              className="font-semibold text-sm text-gray-900 hover:text-gray-700 transition-colors inline-flex items-center gap-2"
                            >
                              {reviewer?.first_name} {reviewer?.last_name}
                              {reviewer?.verification_tier && (
                                <VerificationBadge tier={reviewer.verification_tier as 1 | 2 | 3} size="sm" showTooltip={false} />
                              )}
                            </Link>
                            {ride && (
                              <p className="text-xs text-gray-500 mt-1">
                                {ride.origin_city} → {ride.destination_city}
                                {ride.origin_country && ` • ${ride.origin_country}`}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{reviewDate}</span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
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

                        {/* Review Text */}
                        {review.review_text && (
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
