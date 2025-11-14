/**
 * Username Generator Utility
 * Generates unique usernames from first name + last name
 */

import { supabase } from './supabase'

/**
 * Generates a username from first name and last name
 * Format: firstnamelastname (max 8 characters)
 * If combined length exceeds 8 chars, trims from end of last name
 * If still not unique, adds numbers at the end
 *
 * Examples:
 * - "John" + "Doe" -> "johndoe"
 * - "Alexander" + "Smith" -> "alexands" (8 chars max)
 * - "John" + "Doe" (if taken) -> "johndoe1"
 *
 * @param firstName - User's first name
 * @param lastName - User's last name
 * @returns Promise<string> - Unique username
 */
export async function generateUniqueUsername(firstName: string, lastName: string = ''): Promise<string> {
  // Sanitize names: remove spaces, special characters, convert to lowercase
  const sanitizedFirst = firstName
    .toLowerCase()
    .replace(/[^a-z]/g, '') // Keep only letters
    .trim()

  const sanitizedLast = lastName
    .toLowerCase()
    .replace(/[^a-z]/g, '') // Keep only letters
    .trim()

  // Combine first and last name
  let baseUsername = sanitizedFirst + sanitizedLast

  // Trim to max 8 characters if needed (trim from end of last name)
  if (baseUsername.length > 8) {
    baseUsername = baseUsername.slice(0, 8)
  }

  // If username is too short, pad with username requirements
  if (baseUsername.length < 3) {
    baseUsername = baseUsername.padEnd(3, 'x')
  }

  // Try the base username first
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('username')
    .eq('username', baseUsername)
    .maybeSingle()

  if (checkError) {
    console.error('Error checking username uniqueness:', checkError)
  }

  // If username is available, return it
  if (!existingUser) {
    return baseUsername
  }

  // If base username is taken, add numbers
  let attempts = 0
  const maxAttempts = 50 // Prevent infinite loops

  while (attempts < maxAttempts) {
    // Add incrementing number suffix (1, 2, 3, etc.)
    const suffix = (attempts + 1).toString()
    const candidateUsername = baseUsername.slice(0, 8 - suffix.length) + suffix

    // Check if username already exists
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', candidateUsername)
      .maybeSingle()

    if (error) {
      console.error('Error checking username uniqueness:', error)
      attempts++
      continue
    }

    // If username doesn't exist, it's unique!
    if (!data) {
      return candidateUsername
    }

    attempts++
  }

  // Fallback: If we couldn't generate a unique username, add timestamp
  const timestamp = Date.now().toString().slice(-4)
  return baseUsername.slice(0, 4) + timestamp
}

/**
 * Validates username format
 * @param username - Username to validate
 * @returns boolean - True if valid
 */
export function isValidUsername(username: string): boolean {
  // Must be between 3 and 8 characters
  if (username.length < 3 || username.length > 8) return false

  // Must contain only lowercase letters and numbers
  if (!/^[a-z0-9]+$/.test(username)) return false

  return true
}

/**
 * Formats username for display (lowercase)
 * @param username - Username to format
 * @returns string - Formatted username
 */
export function formatUsername(username: string): string {
  return username.toLowerCase()
}
