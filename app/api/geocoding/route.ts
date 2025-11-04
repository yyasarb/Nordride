import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json(
      { error: 'Address parameter is required' },
      { status: 400 }
    )
  }

  const apiKey = process.env.LOCATIONIQ_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'LocationIQ API key not configured' },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://us1.locationiq.com/v1/search?key=${apiKey}&q=${encodeURIComponent(address)}&format=json&limit=5`
    )

    if (!response.ok) {
      throw new Error(`LocationIQ API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform the response to a simpler format
    const results = data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }))

    return NextResponse.json(results)
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    )
  }
}
