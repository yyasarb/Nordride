import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { start, end } = body

    if (!start || !end || !start.lat || !start.lon || !end.lat || !end.lon) {
      return NextResponse.json(
        { error: 'Start and end coordinates are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENROUTE_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouteService API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          coordinates: [
            [start.lon, start.lat],
            [end.lon, end.lat]
          ],
          instructions: false
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenRouteService error:', errorText)
      throw new Error(`OpenRouteService API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: 'No route found' },
        { status: 404 }
      )
    }

    const route = data.routes[0]
    const distanceKm = (route.summary.distance / 1000).toFixed(2)
    const durationMinutes = Math.round(route.summary.duration / 60)

    return NextResponse.json({
      distance_km: parseFloat(distanceKm),
      duration_minutes: durationMinutes,
      polyline: route.geometry,
      summary: route.summary
    })
  } catch (error) {
    console.error('Routing error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate route' },
      { status: 500 }
    )
  }
}
