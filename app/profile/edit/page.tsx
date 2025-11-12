'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, User, ArrowLeft, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Comprehensive list of languages
const ALL_LANGUAGES = [
  'Afrikaans', 'Albanian', 'Arabic', 'Armenian', 'Basque', 'Bengali', 'Bulgarian', 'Catalan',
  'Cambodian', 'Chinese (Mandarin)', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English',
  'Estonian', 'Fiji', 'Finnish', 'French', 'Georgian', 'German', 'Greek', 'Gujarati',
  'Hebrew', 'Hindi', 'Hungarian', 'Icelandic', 'Indonesian', 'Irish', 'Italian', 'Japanese',
  'Javanese', 'Korean', 'Latin', 'Latvian', 'Lithuanian', 'Macedonian', 'Malay', 'Malayalam',
  'Maltese', 'Maori', 'Marathi', 'Mongolian', 'Nepali', 'Norwegian', 'Persian', 'Polish',
  'Portuguese', 'Punjabi', 'Quechua', 'Romanian', 'Russian', 'Samoan', 'Serbian', 'Slovak',
  'Slovenian', 'Spanish', 'Swahili', 'Swedish', 'Tamil', 'Tatar', 'Telugu', 'Thai', 'Tibetan',
  'Tonga', 'Turkish', 'Ukrainian', 'Urdu', 'Uzbek', 'Vietnamese', 'Welsh', 'Xhosa'
].sort()

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

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'available' | 'taken' | 'invalid' | 'unchanged' | null>(null)
  const [usernameError, setUsernameError] = useState('')
  const [bio, setBio] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [facebookUrl, setFacebookUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [languageSearch, setLanguageSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFirstName(profileData.first_name || '')
        setLastName(profileData.last_name || '')
        setUsername(profileData.username || '')
        setOriginalUsername(profileData.username || '')
        setBio(profileData.bio || '')
        setSelectedLanguages(profileData.languages || [])
        setSelectedInterests(profileData.interests || [])
        setFacebookUrl(profileData.facebook_profile_url || '')
        setInstagramUrl(profileData.instagram_profile_url || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Check username availability with debounce
  useEffect(() => {
    const checkUsername = async () => {
      const trimmed = username.trim().toLowerCase()

      // If empty or unchanged, don't check
      if (!trimmed || trimmed === originalUsername.toLowerCase()) {
        if (trimmed === originalUsername.toLowerCase()) {
          setUsernameStatus('unchanged')
        } else {
          setUsernameStatus(null)
        }
        setUsernameError('')
        return
      }

      // Validate format first
      const usernameRegex = /^[a-z0-9]([a-z0-9._]{0,28}[a-z0-9])?$/
      if (!usernameRegex.test(trimmed) || trimmed.length < 2 || trimmed.length > 30) {
        setUsernameStatus('invalid')
        setUsernameError('Username must be 2-30 characters: lowercase letters, numbers, dots, and underscores')
        return
      }

      setUsernameStatus('checking')
      setUsernameError('')

      try {
        const { data, error } = await supabase
          .rpc('is_username_available', {
            p_username: trimmed,
            p_user_id: user?.id || null
          })

        if (error) throw error

        if (data === true) {
          setUsernameStatus('available')
          setUsernameError('')
        } else {
          setUsernameStatus('taken')
          setUsernameError('This username is already taken or reserved')
        }
      } catch (error) {
        console.error('Username check failed:', error)
        setUsernameStatus('invalid')
        setUsernameError('Could not verify username availability')
      }
    }

    const timer = setTimeout(checkUsername, 500)
    return () => clearTimeout(timer)
  }, [username, originalUsername, user?.id])

  const compressImage = (file: File): Promise<Blob> => {
    const maxSize = 512
    const quality = 0.7

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width)
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height)
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Canvas is empty'))
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setAvatarUploading(true)
    setError('')

    try {
      const compressedBlob = await compressImage(file)
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' })

      const fileName = `${user.id}-${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, compressedFile, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const publicUrl = urlData.publicUrl

      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: publicUrl, profile_picture_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile((prev: any) => (prev ? { ...prev, photo_url: publicUrl } : prev))
      setSuccess('Profile picture updated!')
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      setError('Failed to upload profile picture')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(language) ? prev.filter((l) => l !== language) : [...prev, language]
    )
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleSave = async () => {
    if (!user) return

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    // Check username status
    if (username.trim() && usernameStatus !== 'available' && usernameStatus !== 'unchanged') {
      setError('Please choose a valid and available username')
      return
    }

    // Check rate limit if username changed
    if (username.trim().toLowerCase() !== originalUsername.toLowerCase() && profile?.username_changed_at) {
      const lastChanged = new Date(profile.username_changed_at)
      const daysSinceChange = (Date.now() - lastChanged.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceChange < 7) {
        const daysRemaining = Math.ceil(7 - daysSinceChange)
        setError(`You can change your username again in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`)
        return
      }
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const updateData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        username: username.trim().toLowerCase(),
        bio: bio.trim() || null,
        languages: selectedLanguages.length > 0 ? selectedLanguages : null,
        interests: selectedInterests.length > 0 ? selectedInterests : null,
        facebook_profile_url: facebookUrl.trim() || null,
        instagram_profile_url: instagramUrl.trim() || null,
      }

      // If username changed, update timestamp
      if (username.trim().toLowerCase() !== originalUsername.toLowerCase()) {
        updateData.username_changed_at = new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) throw updateError

      // Recalculate profile completion
      await supabase.rpc('calculate_profile_completion', { user_id: user.id })

      setSuccess('Profile updated successfully!')
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const filteredLanguages = ALL_LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  )

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
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => router.push('/profile')}
          className="mb-6 rounded-full w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <h1 className="font-display text-5xl font-bold mb-8">Edit Profile</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-2">
            <X className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 flex items-center gap-2">
            <Check className="h-5 w-5" />
            {success}
          </div>
        )}

        <Card className="p-8 shadow-lg border-2 space-y-8">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium mb-3">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profile?.photo_url ? (
                  <NextImage
                    src={profile.photo_url}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                <label className="absolute -bottom-2 -right-2 bg-white border-2 rounded-full p-2 shadow cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                  />
                  <Camera className="h-5 w-5" />
                </label>
              </div>
              <div className="text-sm text-gray-600">
                <p>Click the camera icon to upload a new photo</p>
                <p className="text-xs mt-1">JPG, PNG, WebP. Max 10MB. Will be compressed.</p>
              </div>
            </div>
            {avatarUploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
          </div>

          {/* First Name & Last Name */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                placeholder="Your first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                placeholder="Your last name"
                required
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  usernameStatus === 'available'
                    ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                    : usernameStatus === 'taken' || usernameStatus === 'invalid'
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                    : usernameStatus === 'unchanged'
                    ? 'border-gray-300 focus:ring-black focus:border-black'
                    : 'border-gray-200 focus:ring-black focus:border-black'
                }`}
                placeholder="Choose a unique username"
                maxLength={30}
              />
              {usernameStatus === 'checking' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                </div>
              )}
              {usernameStatus === 'available' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              )}
              {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              )}
            </div>
            {usernameError ? (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <X className="h-3 w-3" />
                {usernameError}
              </p>
            ) : usernameStatus === 'available' ? (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Username is available!
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                2-30 characters: lowercase letters, numbers, dots, and underscores
              </p>
            )}
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-sm font-medium mb-2">About Me</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself, your interests, what you like to talk about during rides, etc."
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[120px] resize-y"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{bio.length}/500 characters</span>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium mb-3">Languages I Speak</label>

            {/* Selected Languages */}
            {selectedLanguages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedLanguages.map((lang) => (
                  <div
                    key={lang}
                    className="px-3 py-1 bg-black text-white rounded-full text-sm flex items-center gap-2"
                  >
                    {lang}
                    <button
                      type="button"
                      onClick={() => handleLanguageToggle(lang)}
                      className="hover:text-red-300 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Language Selector */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search and select languages..."
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                onFocus={() => setShowLanguageDropdown(true)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
              />

              {showLanguageDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLanguageDropdown(false)}
                  />
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-black rounded-xl shadow-xl max-h-64 overflow-y-auto">
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            handleLanguageToggle(lang)
                            setLanguageSearch('')
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors flex items-center justify-between ${
                            selectedLanguages.includes(lang) ? 'bg-green-50' : ''
                          }`}
                        >
                          <span>{lang}</span>
                          {selectedLanguages.includes(lang) && (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">No languages found</div>
                    )}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedLanguages.length === 0
                ? 'Select at least one language to complete your profile'
                : `${selectedLanguages.length} language${selectedLanguages.length > 1 ? 's' : ''} selected`}
            </p>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-3">Interests</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-full text-sm border-2 transition-colors ${
                    selectedInterests.includes(interest)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {selectedInterests.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {selectedInterests.length} interest{selectedInterests.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Social Media Links */}
          <div>
            <label className="block text-sm font-medium mb-3">Social Media (Optional)</label>
            <p className="text-xs text-gray-500 mb-3">
              Add your social media profiles to help build trust with other users
            </p>

            <div className="space-y-3">
              {/* Facebook */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Facebook Profile URL</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instagram Profile URL</label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="flex-1 rounded-full border-2 py-6 text-lg"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-full py-6 text-lg"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
