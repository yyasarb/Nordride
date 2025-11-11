import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Cron job endpoint to expire booking requests older than 24 hours
 * Should be called by external cron service (e.g., Vercel Cron, cron-job.org)
 * Recommended schedule: Every 30 minutes
 */
export async function GET(request: Request) {
  try {
    // Optional: Add authorization header check for security
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the Supabase function to expire old requests
    const { error } = await supabase.rpc('expire_old_booking_requests')

    if (error) {
      console.error('Error expiring booking requests:', error)
      return NextResponse.json(
        { error: 'Failed to expire requests', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Expired booking requests processed successfully',
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
