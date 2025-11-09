/**
 * Route Proximity Calculation Utilities
 *
 * This module provides functions to calculate the proximity of points to route geometries
 * for the ride matching system.
 */

export type Point = {
  lat: number
  lon: number
}

export type ProximityResult = {
  distanceKm: number
  closestPoint: Point
}

export type RouteProximityMatch = {
  departureProximity: ProximityResult
  destinationProximity: ProximityResult
  isMatch: boolean
  matchQuality: 'perfect' | 'nearby' | 'none'
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param point1 First point
 * @param point2 Second point
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat)
  const dLon = toRadians(point2.lon - point1.lon)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Decode a polyline string into an array of coordinate pairs
 * @param encodedPolyline Encoded polyline string from OpenRouteService
 * @param precision Precision level (default 5 for OpenRouteService)
 * @returns Array of Point objects
 */
export function decodePolyline(encodedPolyline: string, precision: number = 5): Point[] {
  try {
    const points: Point[] = []
    let index = 0
    let lat = 0
    let lon = 0
    const factor = Math.pow(10, precision)

    while (index < encodedPolyline.length) {
      // Decode latitude
      let result = 0
      let shift = 0
      let byte = 0

      do {
        byte = encodedPolyline.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)

      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1
      lat += deltaLat

      // Decode longitude
      result = 0
      shift = 0

      do {
        byte = encodedPolyline.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)

      const deltaLon = result & 1 ? ~(result >> 1) : result >> 1
      lon += deltaLon

      points.push({
        lat: lat / factor,
        lon: lon / factor
      })
    }

    return points
  } catch (error) {
    console.error('Error decoding polyline:', error)
    return []
  }
}

/**
 * Find the minimum distance from a point to a route (represented as a polyline)
 * @param point The point to check
 * @param routePoints Array of points representing the route
 * @returns Proximity result with distance and closest point
 */
export function calculatePointToRouteDistance(
  point: Point,
  routePoints: Point[]
): ProximityResult {
  if (routePoints.length === 0) {
    return {
      distanceKm: Infinity,
      closestPoint: point
    }
  }

  let minDistance = Infinity
  let closestPoint = routePoints[0]

  // Check distance to each point on the route
  for (const routePoint of routePoints) {
    const distance = calculateDistance(point, routePoint)
    if (distance < minDistance) {
      minDistance = distance
      closestPoint = routePoint
    }
  }

  // Also check distance to line segments between consecutive points
  for (let i = 0; i < routePoints.length - 1; i++) {
    const segmentStart = routePoints[i]
    const segmentEnd = routePoints[i + 1]
    const distToSegment = pointToSegmentDistance(point, segmentStart, segmentEnd)

    if (distToSegment.distance < minDistance) {
      minDistance = distToSegment.distance
      closestPoint = distToSegment.closestPoint
    }
  }

  return {
    distanceKm: minDistance,
    closestPoint
  }
}

/**
 * Calculate the minimum distance from a point to a line segment
 * Uses perpendicular distance when applicable, otherwise distance to endpoints
 */
function pointToSegmentDistance(
  point: Point,
  segmentStart: Point,
  segmentEnd: Point
): { distance: number; closestPoint: Point } {
  // Vector from segment start to end
  const dx = segmentEnd.lon - segmentStart.lon
  const dy = segmentEnd.lat - segmentStart.lat

  // If segment is actually a point
  if (dx === 0 && dy === 0) {
    return {
      distance: calculateDistance(point, segmentStart),
      closestPoint: segmentStart
    }
  }

  // Calculate the parameter t of the closest point on the line segment
  // t = 0 means closest to start, t = 1 means closest to end
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.lon - segmentStart.lon) * dx + (point.lat - segmentStart.lat) * dy) /
        (dx * dx + dy * dy)
    )
  )

  // Calculate the closest point on the segment
  const closestPoint: Point = {
    lat: segmentStart.lat + t * dy,
    lon: segmentStart.lon + t * dx
  }

  return {
    distance: calculateDistance(point, closestPoint),
    closestPoint
  }
}

/**
 * Check if a ride route matches a rider's journey based on proximity
 * @param riderDeparture Rider's departure point
 * @param riderDestination Rider's destination point
 * @param encodedRoutePolyline Driver's route polyline (encoded)
 * @param maxDistanceKm Maximum allowed distance (default 20km)
 * @returns Route proximity match result
 */
export function checkRouteProximity(
  riderDeparture: Point,
  riderDestination: Point,
  encodedRoutePolyline: string,
  maxDistanceKm: number = 20
): RouteProximityMatch {
  const routePoints = decodePolyline(encodedRoutePolyline)

  if (routePoints.length === 0) {
    return {
      departureProximity: { distanceKm: Infinity, closestPoint: riderDeparture },
      destinationProximity: { distanceKm: Infinity, closestPoint: riderDestination },
      isMatch: false,
      matchQuality: 'none'
    }
  }

  const departureProximity = calculatePointToRouteDistance(riderDeparture, routePoints)
  const destinationProximity = calculatePointToRouteDistance(riderDestination, routePoints)

  // Both points must be within maxDistanceKm for a match
  const isMatch =
    departureProximity.distanceKm <= maxDistanceKm &&
    destinationProximity.distanceKm <= maxDistanceKm

  // Determine match quality
  let matchQuality: 'perfect' | 'nearby' | 'none' = 'none'

  if (isMatch) {
    // "Perfect" if both points are within 5km
    if (departureProximity.distanceKm <= 5 && destinationProximity.distanceKm <= 5) {
      matchQuality = 'perfect'
    } else {
      matchQuality = 'nearby'
    }
  }

  return {
    departureProximity,
    destinationProximity,
    isMatch,
    matchQuality
  }
}

/**
 * Get a human-readable label for proximity match quality
 */
export function getProximityLabel(matchQuality: 'perfect' | 'nearby' | 'none'): string {
  switch (matchQuality) {
    case 'perfect':
      return 'Perfect route match'
    case 'nearby':
      return 'Nearby route (within 20 km)'
    case 'none':
      return 'Route does not match'
  }
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}
