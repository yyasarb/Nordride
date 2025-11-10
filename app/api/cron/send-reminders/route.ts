import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Cron job endpoint to send ride reminders
 * Should be called by external cron service at different intervals:
 * - Every hour for 1-hour reminders
 * - Twice daily for 12-hour reminders
 * - Once daily for 24-hour reminders
 *
 * Usage: /api/cron/send-reminders?hours=24 (or 12, or 1)
 */
export async function GET(request: Request) {
  try {
    // Optional: Add authorization header check for security
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get hours parameter from query string
    const { searchParams } = new URL(request.url)
    const hoursParam = searchParams.get('hours')
    const hours = hoursParam ? parseInt(hoursParam, 10) : 24

    // Validate hours parameter
    if (![1, 12, 24].includes(hours)) {
      return NextResponse.json(
        { error: 'Invalid hours parameter. Must be 1, 12, or 24' },
        { status: 400 }
      )
    }

    // Call the Supabase function to send reminders
    const { data, error } = await supabase.rpc('send_ride_reminders', { p_hours_before: hours })

    if (error) {
      console.error(`Error sending ${hours}h reminders:`, error)
      return NextResponse.json(
        { error: 'Failed to send reminders', details: error.message },
        { status: 500 }
      )
    }

    const remindersSent = data || 0

    return NextResponse.json({
      success: true,
      message: `Sent ${remindersSent} reminders for rides in ${hours} hours`,
      remindersSent,
      hoursBeforeDeparture: hours,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
