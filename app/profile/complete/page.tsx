'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, Check, X } from 'lucide-react'
import { LogoLink } from '@/components/layout/logo-link'

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
  'Technology',
  'Travel',
  'Food & Cooking',
  'Photography',
  'Movies & TV',
  'Books & Reading',
  'Gaming',
  'Art & Design',
  'Fitness & Health',
  'Nature & Outdoors',
  'Fashion',
  'Business & Entrepreneurship',
  'Science',
  'Politics & Current Events',
  'Pets & Animals',
  'Meditation & Mindfulness',
  'DIY & Crafts',
  'Comedy & Humor',
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form state
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)

  // Validation states
  const [bioError, setBioError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login')
          return
        }

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (userData) {
          setUser(userData)
          // Pre-fill if they already have some data
          setSelectedLanguages(userData.languages || [])
          setSelectedInterests(userData.interests || [])
          setBio(userData.bio || '')
          if (userData.photo_url || userData.profile_picture_url) {
            setProfilePicturePreview(userData.photo_url || userData.profile_picture_url)
          }
        }
      } catch (err) {
        console.error('Failed to load user:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router, supabase])

  const handleLanguageToggle = (code: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    )
  }

  const handleBioChange = (value: string) => {
    setBio(value)
    if (value.length < 50) {
      setBioError(`Bio must be at least 50 characters (${value.length}/50)`)
    } else {
      setBioError('')
    }
  }

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfilePicture(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
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
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Failed to compress image'))
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

  const handleSave = async () => {
    setError('')

    // Validate required fields
    if (selectedLanguages.length === 0) {
      setError('Please select at least one language')
      return
    }

    if (selectedInterests.length < 3) {
      setError('Please select at least 3 interests')
      return
    }

    if (bio.length < 50) {
      setError('Bio must be at least 50 characters')
      return
    }

    if (!profilePicture && !profilePicturePreview) {
      setError('Please upload a profile picture')
      return
    }

    setSaving(true)

    try {
      let photoUrl = profilePicturePreview

      // Upload profile picture if new one selected
      if (profilePicture) {
        const compressedImage = await compressImage(profilePicture)
        const fileName = `${user.id}-${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, compressedImage, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
        photoUrl = urlData.publicUrl
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          languages: selectedLanguages,
          interests: selectedInterests,
          bio: bio.trim(),
          photo_url: photoUrl,
          profile_picture_url: photoUrl,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Recalculate profile completion
      await supabase.rpc('calculate_profile_completion', { user_id: user.id })

      // Redirect to profile page
      router.push('/profile')
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSkip = () => {
    router.push('/profile')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <LogoLink />
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-display text-5xl font-bold mb-3">Complete Your Profile</h1>
          <p className="text-gray-600 text-lg">
            Help other riders get to know you better. You can always update this later.
          </p>
        </div>

        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-2 border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </Card>
        )}

        <div className="space-y-8">
          {/* Profile Picture */}
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border-2"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or WebP. Max 10MB. Will be resized automatically.
                </p>
              </div>
            </div>
          </Card>

          {/* Languages */}
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-4">
              Languages You Speak <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">Select at least one language</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLanguageToggle(lang.code)}
                  className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                    selectedLanguages.includes(lang.code)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  {selectedLanguages.includes(lang.code) && <Check className="inline h-4 w-4 mr-1" />}
                  {lang.name}
                </button>
              ))}
            </div>
          </Card>

          {/* Interests */}
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-4">
              Your Interests <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select at least 3 interests ({selectedInterests.length}/20)
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-black'
                  }`}
                >
                  {selectedInterests.includes(interest) && <Check className="inline h-4 w-4 mr-1" />}
                  {interest}
                </button>
              ))}
            </div>
          </Card>

          {/* Bio */}
          <Card className="p-6">
            <h2 className="font-semibold text-xl mb-4">
              About You <span className="text-red-500">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Tell other riders about yourself (minimum 50 characters)
            </p>
            <textarea
              value={bio}
              onChange={(e) => handleBioChange(e.target.value)}
              placeholder="Tell us about yourself, your interests, what you do, or anything you'd like to share with potential ride companions..."
              rows={5}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all ${
                bioError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between items-center mt-2">
              <p className={`text-sm ${bioError ? 'text-red-600' : 'text-gray-500'}`}>
                {bio.length}/50 characters minimum
              </p>
              {bio.length >= 50 && (
                <span className="text-green-600 text-sm flex items-center gap-1">
                  <Check className="h-4 w-4" /> Looks good!
                </span>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-full text-lg py-6"
              size="lg"
            >
              {saving ? 'Saving...' : 'Complete Profile'}
            </Button>
            <Button
              onClick={handleSkip}
              variant="outline"
              disabled={saving}
              className="flex-1 rounded-full text-lg py-6 border-2"
              size="lg"
            >
              Skip for Now
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            You can always edit your profile later from your profile page
          </p>
        </div>
      </div>
    </div>
  )
}
