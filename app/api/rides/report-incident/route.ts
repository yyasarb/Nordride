import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API endpoint to record user behavior incidents
 * This tracks no-shows, late arrivals, and late cancellations
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, rideId, incidentType, reportedBy, description } = body

    // Validate required fields
    if (!userId || !rideId || !incidentType || !reportedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate incident type
    const validIncidentTypes = ['no_show', 'late', 'cancelled_late']
    if (!validIncidentTypes.includes(incidentType)) {
      return NextResponse.json(
        { error: 'Invalid incident type' },
        { status: 400 }
      )
    }

    // Record the incident
    const { error: incidentError } = await supabase
      .from('user_behavior_tracking')
      .insert({
        user_id: userId,
        ride_id: rideId,
        incident_type: incidentType,
        reported_by: reportedBy,
        description: description || null,
      })

    if (incidentError) {
      console.error('Error recording incident:', incidentError)
      return NextResponse.json(
        { error: 'Failed to record incident' },
        { status: 500 }
      )
    }

    // Count recent incidents (last 30 days) for this user
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentIncidents, error: countError } = await supabase
      .from('user_behavior_tracking')
      .select('id, incident_type')
      .eq('user_id', userId)
      .gte('incident_date', thirtyDaysAgo.toISOString())

    if (countError) {
      console.error('Error counting incidents:', countError)
    }

    const incidentCount = recentIncidents?.length || 0
    const noShowCount = recentIncidents?.filter(i => i.incident_type === 'no_show').length || 0

    // Check if user should be warned or suspended
    let warningMessage = null
    let shouldSuspend = false

    if (noShowCount >= 3) {
      shouldSuspend = true
      warningMessage = 'User has 3 or more no-shows in the last 30 days and should be suspended'
    } else if (incidentCount >= 5) {
      shouldSuspend = true
      warningMessage = 'User has 5 or more incidents in the last 30 days and should be suspended'
    } else if (noShowCount >= 2) {
      warningMessage = 'User has 2 no-shows - one more will result in suspension'
    } else if (incidentCount >= 3) {
      warningMessage = 'User has 3+ incidents - continued issues may result in suspension'
    }

    // Send notification to the user about the incident
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'behavior_warning',
        title: incidentType === 'no_show' ? 'No-Show Reported' : 'Incident Reported',
        body: warningMessage || `An incident (${incidentType}) has been reported for one of your rides. Please ensure you follow community guidelines.`,
      })

    if (notifError) {
      console.error('Error sending notification:', notifError)
    }

    return NextResponse.json({
      success: true,
      message: 'Incident recorded successfully',
      incidentCount,
      noShowCount,
      warningMessage,
      shouldSuspend,
    })
  } catch (error: any) {
    console.error('Error in report-incident API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
