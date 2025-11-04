import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

export function formatCurrency(amount: number, currency = 'SEK'): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function calculateCostPerPerson(totalCost: number, totalPeople: number): number {
  return Math.round(totalCost / totalPeople)
}

export function encodePolyline(coordinates: [number, number][]): string {
  // Google polyline encoding algorithm implementation
  // Placeholder - use a library in production
  return btoa(JSON.stringify(coordinates))
}

export function decodePolyline(encoded: string): [number, number][] {
  // Google polyline decoding algorithm implementation
  // Placeholder - use a library in production
  try {
    return JSON.parse(atob(encoded))
  } catch {
    return []
  }
}
