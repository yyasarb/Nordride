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

      // Fetch reviews and calculate average rating
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, rating')
        .eq('reviewee_id', authUser.id)
        .eq('is_visible', true)

      if (reviewsData && reviewsData.length > 0) {
        setReviewCount(reviewsData.length)
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
    <div className="min-h-screen bg-white">
      {/* Single-column center layout */}
      <div className="container mx-auto px-4 py-12 max-w-[1100px]">

        {/* HEADER SECTION: Avatar, Name, Username, Badge */}
        <Card className="p-8 mb-6 border shadow-sm">
          <div className="flex items-start gap-6">
            {/* Avatar with Edit Overlay */}
            <div className="relative group cursor-pointer">
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={avatarUploading}
              />
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {profile?.photo_url || profile?.profile_picture_url ? (
                  <NextImage
                    src={profile.photo_url || profile.profile_picture_url}
                    alt={[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Avatar'}
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover border border-gray-200"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                {/* Edit overlay on hover */}
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </label>
              {avatarUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Name, Username, Email, Badge */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-3xl font-bold">
                  {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User'}
                </h2>
                {profile?.verification_tier && (
                  <VerificationBadge tier={profile.verification_tier as 1 | 2 | 3} size="lg" showTooltip />
                )}
              </div>
              {profile?.username && (
                <p className="text-gray-500 text-sm">@{profile.username}</p>
              )}
              <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              {/* Social Media Icons */}
              {(profile?.facebook_profile_url || profile?.instagram_profile_url || profile?.spotify_connected) && (
                <div className="flex items-center gap-2 mt-2">
                  {profile?.facebook_profile_url && (
                    <a
                      href={profile.facebook_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="h-3.5 w-3.5 text-white" />
                    </a>
                  )}
                  {profile?.instagram_profile_url && (
                    <a
                      href={profile.instagram_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center hover:from-purple-700 hover:to-pink-700 transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="h-3.5 w-3.5 text-white" />
                    </a>
                  )}
                  {profile?.spotify_connected && (
                    <div
                      className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center"
                      title="Spotify Connected"
                    >
                      <Music className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button asChild className="rounded-full bg-[#2C2C2C] text-white hover:bg-black">
                <Link href="/profile/edit" className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-2">
                <Link href={`/profile/${user?.id}`}>
                  View Public Profile
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        {/* SUMMARY ROW: Three Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Ride Statistics */}
          <Card className="p-4 shadow-sm">
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

          {/* Reviews */}
          <Card className="p-4 shadow-sm">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Reviews</p>
              <div className="flex items-center justify-center gap-2">
                {averageRating > 0 && (
                  <>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(averageRating)
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">({reviewCount})</span>
                  </>
                )}
                {averageRating === 0 && <p className="text-sm text-gray-500">No reviews yet</p>}
              </div>
            </div>
          </Card>

          {/* Verification - Show highest tier achieved */}
          <Card className="p-4 shadow-sm">
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

        {/* BIO SECTION */}
        {profile?.bio && (
          <Card className="p-6 mb-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">About Me</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          </Card>
        )}

        {/* PROFILE DETAILS GRID: Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* Road Playlist */}
            {user && (
              <SpotifyPlaylist
                userId={user.id}
                profile={profile}
                onUpdate={loadProfile}
                isOwnProfile={true}
              />
            )}

            {/* My Vehicles */}
            <Card className="p-4 shadow-sm">
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
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* Interests */}
            <Card className="p-4 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Interests</h3>
              {profile?.interests && profile.interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-black text-white rounded-xl text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No interests added yet</p>
              )}
            </Card>

            {/* Languages I Speak */}
            <Card className="p-4 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Languages I Speak</h3>
              {profile?.languages && profile.languages.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-xl text-sm border"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No languages added yet</p>
              )}
            </Card>
          </div>
        </div>

        {/* FRIENDS SECTION */}
        <Card className="p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">My Friends</h3>
            {friendCount > 0 && (
              <Link href="/profile/friends" className="text-sm text-gray-600 hover:text-black">
                View all ({friendCount})
              </Link>
            )}
          </div>
          {friends.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No friends added yet</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {friends.map((friend: any) => (
                <Link
                  key={friend.user_id}
                  href={`/profile/${friend.user_id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  {friend.photo_url || friend.profile_picture_url ? (
                    <NextImage
                      src={friend.photo_url || friend.profile_picture_url}
                      alt={friend.full_name || 'Friend'}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-black transition-colors"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-black transition-colors">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {[friend.first_name, friend.last_name].filter(Boolean).join(' ') || friend.full_name || 'User'}
                      </p>
                      {friend.verification_tier && (
                        <VerificationBadge tier={friend.verification_tier as 1 | 2 | 3} size="sm" showTooltip />
                      )}
                    </div>
                    {friend.username && (
                      <p className="text-xs text-gray-500">@{friend.username}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
