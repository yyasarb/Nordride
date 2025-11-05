'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, User, ArrowLeft, Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LogoLink } from '@/components/layout/logo-link'

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
  const [bio, setBio] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [languageSearch, setLanguageSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
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
        setBio(profileData.bio || '')
        setSelectedLanguages(profileData.languages || [])
        setSelectedInterests(profileData.interests || [])
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

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

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          bio: bio.trim() || null,
          languages: selectedLanguages.length > 0 ? selectedLanguages : null,
          interests: selectedInterests.length > 0 ? selectedInterests : null,
        })
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <LogoLink />
          <Button
            variant="ghost"
            onClick={() => router.push('/profile')}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-24 max-w-3xl">
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
                  <img
                    src={profile.photo_url}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-4 border-emerald-100"
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
