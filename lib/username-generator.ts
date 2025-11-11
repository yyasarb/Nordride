/**
 * Username Generator Utility
 * Generates unique 6-character usernames from first name + numbers
 */

import { supabase } from './supabase'

/**
 * Generates a 6-character username from first name and random numbers
 * Format: [3 letters from name][3 random digits]
 * Example: "John" -> "joh482"
 *
 * @param firstName - User's first name
 * @returns Promise<string> - Unique 6-character username
 */
export async function generateUniqueUsername(firstName: string): Promise<string> {
  // Sanitize first name: remove spaces, special characters, convert to lowercase
  const sanitizedName = firstName
    .toLowerCase()
    .replace(/[^a-z]/g, '') // Keep only letters
    .slice(0, 3) // Take first 3 characters
    .padEnd(3, 'x') // Pad with 'x' if name is shorter than 3 chars

  let attempts = 0
  const maxAttempts = 50 // Prevent infinite loops

  while (attempts < maxAttempts) {
    // Generate 3 random digits (000-999)
    const randomDigits = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')

    const candidateUsername = sanitizedName + randomDigits

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
  const timestamp = Date.now().toString().slice(-3)
  return sanitizedName + timestamp
}

/**
 * Validates username format
 * @param username - Username to validate
 * @returns boolean - True if valid
 */
export function isValidUsername(username: string): boolean {
  // Must be exactly 6 characters
  if (username.length !== 6) return false

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
