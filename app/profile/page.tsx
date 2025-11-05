'use client'

import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Mail, Phone, User, Car as CarIcon, MapPin, Edit2, Camera, FileText, Heart, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Swedish' },
  { code: 'no', name: 'Norwegian' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'pl', name: 'Polish' },
]

const AVAILABLE_INTERESTS = [
  'Music',
  'Sports',
  'Travel',
  'Food',
  'Photography',
  'Reading',
  'Movies',
  'Gaming',
  'Art',
  'Technology',
  'Nature',
  'Fitness',
]

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [stats, setStats] = useState({ ridesAsDriver: 0, ridesAsRider: 0 })
  const [reviewCount, setReviewCount] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState('')
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [vehicleForm, setVehicleForm] = useState({
    brand: '',
    model: '',
    color: '',
    plateNumber: '',
  })
  const [vehicleError, setVehicleError] = useState('')
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [savingLanguages, setSavingLanguages] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState({ completed: false, percentage: 0 })
  const [bio, setBio] = useState('')
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [savingBio, setSavingBio] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [savingInterests, setSavingInterests] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  // Reload profile when page becomes visible (e.g., returning from edit page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProfile()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', loadProfile)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', loadProfile)
    }
  }, [])

  const loadProfile = async () => {
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
        setFirstName(profileData.first_name || '')
        setLastName(profileData.last_name || '')
        setSelectedLanguages(profileData.languages || [])
        setBio(profileData.bio || '')
        setSelectedInterests(profileData.interests || [])
        setStats({
          ridesAsDriver: profileData.total_rides_driver || 0,
          ridesAsRider: profileData.total_rides_rider || 0
        })

        if (!profileData.email_verified) {
          try {
            await supabase
              .from('users')
              .update({ email_verified: true })
              .eq('id', authUser.id)
          } catch (error) {
            console.warn('Failed to auto-confirm email verification:', error)
          }
        }

        // Calculate profile completion
        try {
          const { data: completionData, error: completionError } = await supabase
            .rpc('calculate_profile_completion', { user_id: authUser.id })

          if (!completionError && completionData && completionData.length > 0) {
            setProfileCompletion({
              completed: completionData[0].completed || false,
              percentage: completionData[0].percentage || 0
            })
          }
        } catch (error) {
          console.warn('Failed to calculate profile completion:', error)
        }
      }

      // Get vehicles
      const { data: vehicleData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', authUser.id)

      if (vehicleData) {
        setVehicles(vehicleData)
      }

      const { data: reviewData } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewee_id', authUser.id)
        .eq('is_visible', true)

      setReviewCount(reviewData?.length || 0)

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleNameSave = async () => {
    if (!user) return
    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    if (!trimmedFirst || !trimmedLast) {
      setNameError('Both first and last name are required')
      return
    }
    setNameError('')
    setSavingName(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: trimmedFirst,
          last_name: trimmedLast,
          full_name: `${trimmedFirst} ${trimmedLast}`,
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev: any) =>
        prev
          ? {
              ...prev,
              first_name: trimmedFirst,
              last_name: trimmedLast,
              full_name: `${trimmedFirst} ${trimmedLast}`,
            }
          : prev
      )
      setIsEditingName(false)
    } catch (error) {
      console.error('Failed to update name:', error)
      setNameError('Could not update name. Please try again.')
    } finally {
      setSavingName(false)
    }
  }

  const resetVehicleForm = () => {
    setVehicleForm({ brand: '', model: '', color: '', plateNumber: '' })
    setVehicleError('')
  }

  const handleVehicleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    const { brand, model, color, plateNumber } = vehicleForm
    if (!brand.trim() || !plateNumber.trim()) {
      setVehicleError('Brand and plate number are required')
      return
    }

    setAddingVehicle(true)
    setVehicleError('')

    try {
      const insertPayload = {
        user_id: user.id,
        brand: brand.trim(),
        model: model.trim() || null,
        color: color.trim() || null,
        plate_number: plateNumber.trim().toUpperCase(),
        seats: 4,
        is_primary: vehicles.length === 0,
        smoking_policy: 'no_smoking',
        music_preference: 'normal',
      }

      const { error } = await supabase.from('vehicles').insert(insertPayload)
      if (error) throw error

      const { data: updatedVehicles, error: refreshError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)

      if (refreshError) throw refreshError

      setVehicles(updatedVehicles || [])
      resetVehicleForm()
      setShowVehicleForm(false)

      // Recalculate profile completion after adding vehicle
      try {
        const { data: completionData } = await supabase
          .rpc('calculate_profile_completion', { user_id: user.id })
        if (completionData && completionData.length > 0) {
          setProfileCompletion({
            completed: completionData[0].completed || false,
            percentage: completionData[0].percentage || 0
          })
        }
      } catch (error) {
        console.warn('Failed to recalculate profile completion:', error)
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error)
      setVehicleError('Could not add vehicle. Please check the details and try again.')
    } finally {
      setAddingVehicle(false)
    }
  }

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

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    setAvatarError('')

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

      // Recalculate profile completion after upload
      try {
        const { data: completionData } = await supabase
          .rpc('calculate_profile_completion', { user_id: user.id })
        if (completionData && completionData.length > 0) {
          setProfileCompletion({
            completed: completionData[0].completed || false,
            percentage: completionData[0].percentage || 0
          })
        }
      } catch (error) {
        console.warn('Failed to recalculate profile completion:', error)
      }
    } catch (error) {
      console.error('Avatar upload failed:', error)
      setAvatarError('Could not upload photo. Please try a different image.')
    } finally {
      setAvatarUploading(false)
      event.target.value = ''
    }
  }

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(l => l !== langCode)
        : [...prev, langCode]
    )
  }

  const handleLanguagesSave = async () => {
    if (!user) return
    setSavingLanguages(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({ languages: selectedLanguages.length > 0 ? selectedLanguages : null })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev: any) => (prev ? { ...prev, languages: selectedLanguages } : prev))

      // Recalculate profile completion after language update
      const { data: completionData } = await supabase
        .rpc('calculate_profile_completion', { user_id: user.id })
      if (completionData && completionData.length > 0) {
        setProfileCompletion({
          completed: completionData[0].completed || false,
          percentage: completionData[0].percentage || 0
        })
      }
    } catch (error) {
      console.error('Failed to save languages:', error)
    } finally {
      setSavingLanguages(false)
    }
  }

  const handleBioSave = async () => {
    if (!user) return
    setSavingBio(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({ bio: bio.trim() || null })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev: any) => (prev ? { ...prev, bio: bio.trim() || null } : prev))
      setIsEditingBio(false)
    } catch (error) {
      console.error('Failed to save bio:', error)
    } finally {
      setSavingBio(false)
    }
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleInterestsSave = async () => {
    if (!user) return
    setSavingInterests(true)

    try {
      const { error } = await supabase
        .from('users')
        .update({ interests: selectedInterests.length > 0 ? selectedInterests : null })
        .eq('id', user.id)

      if (error) throw error

      setProfile((prev: any) => (prev ? { ...prev, interests: selectedInterests } : prev))
    } catch (error) {
      console.error('Failed to save interests:', error)
    } finally {
      setSavingInterests(false)
    }
  }

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
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Profile Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-5xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account and view your ride history</p>
            {user?.id && (
              <Link
                href={`/profile/${user.id}`}
                className="inline-block mt-2 text-sm font-medium text-black underline-offset-4 hover:underline"
              >
                View public profile
              </Link>
            )}
          </div>
          <Button asChild variant="outline" className="rounded-full border-2">
            <Link href="/profile/edit" className="flex items-center gap-2">
              <Edit2 className="h-5 w-5" />
              Edit Profile
            </Link>
          </Button>
        </div>

        {/* Profile Completion Card */}
        {!profileCompletion.completed && (
          <Card className="p-6 mb-6 border-2 border-amber-200 bg-amber-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Complete Your Profile</h3>
                <span className="text-sm font-medium">{profileCompletion.percentage}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-full transition-all duration-500"
                  style={{ width: `${profileCompletion.percentage}%` }}
                ></div>
              </div>

              <div className="grid md:grid-cols-2 gap-2 mt-4">
                {(!(profile?.photo_url || profile?.profile_picture_url)) && (
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Upload profile picture (25%)</span>
                  </div>
                )}
                {(!profile?.bio || profile.bio === '') && (
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Write about yourself (25%)</span>
                  </div>
                )}
                {(!profile?.languages || profile.languages.length === 0) && (
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Select languages (25%)</span>
                  </div>
                )}
                {(!profile?.interests || profile.interests.length === 0) && (
                  <div className="flex items-center gap-2 text-sm text-amber-800">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span>Select interests (25%)</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-amber-700 mt-3">
                Complete your profile to get started!
              </p>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 shadow-lg border-2">
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  {profile?.photo_url ? (
                    <NextImage
                      src={profile.photo_url}
                      alt={[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Avatar'}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover border-4 border-emerald-100"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-3xl font-bold">
                    {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'User'}
                  </h2>
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <MessageSquare className="h-4 w-4" />
                    {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="h-5 w-5" />
                  <span>{user?.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="h-5 w-5" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              {profile?.bio && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-600 mb-2">About Me</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}

              {/* Languages */}
              {profile?.languages && profile.languages.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">Languages I speak</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang: string) => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm border"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {profile?.interests && profile.interests.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-600 mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest: string) => (
                      <span
                        key={interest}
                        className="px-4 py-2 bg-black text-white rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Vehicles */}
            <Card className="p-8 shadow-lg border-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl font-bold flex items-center gap-2">
                  <CarIcon className="h-6 w-6" />
                  My Vehicles
                </h3>
                <Button
                  variant="outline"
                  className="rounded-full border-2"
                  onClick={() => {
                    resetVehicleForm()
                    setShowVehicleForm((prev) => !prev)
                  }}
                >
                  {showVehicleForm ? 'Cancel' : 'Add Vehicle'}
                </Button>
              </div>

              {showVehicleForm && (
                <form className="grid gap-4 mb-6" onSubmit={handleVehicleSubmit}>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Brand</label>
                    <input
                      type="text"
                      value={vehicleForm.brand}
                      onChange={(event) =>
                        setVehicleForm((prev) => ({ ...prev, brand: event.target.value }))
                      }
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                      disabled={addingVehicle}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Model</label>
                    <input
                      type="text"
                      value={vehicleForm.model}
                      onChange={(event) =>
                        setVehicleForm((prev) => ({ ...prev, model: event.target.value }))
                      }
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={addingVehicle}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Color</label>
                    <input
                      type="text"
                      value={vehicleForm.color}
                      onChange={(event) =>
                        setVehicleForm((prev) => ({ ...prev, color: event.target.value }))
                      }
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      disabled={addingVehicle}
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Plate Number</label>
                    <input
                      type="text"
                      value={vehicleForm.plateNumber}
                      onChange={(event) =>
                        setVehicleForm((prev) => ({ ...prev, plateNumber: event.target.value }))
                      }
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      required
                      disabled={addingVehicle}
                      autoCapitalize="characters"
                    />
                  </div>
                  {vehicleError && <p className="text-sm text-red-600">{vehicleError}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={addingVehicle}>
                      {addingVehicle ? 'Saving...' : 'Save vehicle'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetVehicleForm()
                        setShowVehicleForm(false)
                      }}
                      disabled={addingVehicle}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {vehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No vehicles added yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="p-4 border-2 rounded-xl hover:border-black transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-lg">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {vehicle.color ? `${vehicle.color} • ` : ''}{vehicle.plate_number}
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

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 shadow-lg border-2">
              <h3 className="font-display text-xl font-bold mb-4">Ride Statistics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 mb-1">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">As Driver</span>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {stats.ridesAsDriver}
                  </p>
                  <p className="text-sm text-green-600">rides completed</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 mb-1">
                    <User className="h-5 w-5" />
                    <span className="font-medium">As Rider</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    {stats.ridesAsRider}
                  </p>
                  <p className="text-sm text-blue-600">rides completed</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-lg border-2">
              <h3 className="font-display text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button asChild className="w-full rounded-full">
                  <Link href="/rides/create">
                    <MapPin className="h-4 w-4 mr-2" />
                    Offer a Ride
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full border-2">
                  <Link href="/rides/search">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find a Ride
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
