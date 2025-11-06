import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Email sender configuration
export const FROM_EMAIL = 'Nordride <noreply@nordride.se>'
export const SUPPORT_EMAIL = 'support@nordride.se'
