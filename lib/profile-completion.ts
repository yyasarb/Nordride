import { supabase } from '@/lib/supabase'

export interface ProfileCompletionStatus {
  isComplete: boolean
  missingFields: string[]
  hasProfilePicture: boolean
  hasVerifiedEmail: boolean
  hasLanguages: boolean
  hasVehicle?: boolean // Only for drivers
}

export async function checkProfileCompletion(userId: string, requiresVehicle: boolean = false): Promise<ProfileCompletionStatus> {
  try {
    // Get user data
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        isComplete: false,
        missingFields: ['authentication'],
        hasProfilePicture: false,
        hasVerifiedEmail: false,
        hasLanguages: false,
      }
    }

    // Get profile data
    const { data: profile } = await supabase
      .from('users')
      .select('profile_picture_url, photo_url, languages, first_name, last_name')
      .eq('id', userId)
      .single()

    // Get vehicles if required
    let hasVehicle = false
    if (requiresVehicle) {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      hasVehicle = (vehicles && vehicles.length > 0) || false
    }

    const missingFields: string[] = []

    // Check profile picture
    const hasProfilePicture = !!(profile?.profile_picture_url || profile?.photo_url)
    if (!hasProfilePicture) {
      missingFields.push('profile picture')
    }

    // Check verified email
    const hasVerifiedEmail = user.email_confirmed_at !== null
    if (!hasVerifiedEmail) {
      missingFields.push('verified email')
    }

    // Check languages
    const hasLanguages = profile?.languages && profile.languages.length > 0
    if (!hasLanguages) {
      missingFields.push('at least one language')
    }

    // Check vehicle for drivers
    if (requiresVehicle && !hasVehicle) {
      missingFields.push('at least one vehicle')
    }

    const isComplete = missingFields.length === 0

    return {
      isComplete,
      missingFields,
      hasProfilePicture,
      hasVerifiedEmail,
      hasLanguages,
      hasVehicle: requiresVehicle ? hasVehicle : undefined,
    }
  } catch (error) {
    console.error('Error checking profile completion:', error)
    return {
      isComplete: false,
      missingFields: ['error checking profile'],
      hasProfilePicture: false,
      hasVerifiedEmail: false,
      hasLanguages: false,
    }
  }
}

export function getProfileCompletionMessage(status: ProfileCompletionStatus, action: string = 'perform this action'): string {
  if (status.isComplete) {
    return ''
  }

  const fieldsText = status.missingFields.join(', ')
  return `Please complete your profile to ${action}. Missing: ${fieldsText}.`
}
