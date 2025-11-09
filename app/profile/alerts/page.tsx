'use client'

import { useState, useEffect, useRef, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Bell,
  BellOff,
  MapPin,
  Trash2,
  Edit,
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type RideAlert = {
  id: string
  user_id: string
  name: string | null
  departure_address: string
  destination_address: string
  proximity_km: number
  is_enabled: boolean
  created_at: string
  updated_at: string
}

type GeocodeResult = {
  display_name: string
  lat: number
  lon: number
}

export default function AlertsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [alerts, setAlerts] = useState<RideAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<RideAlert | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/auth/login?redirect=/profile/alerts')
        return
      }
      setUser(data.user)
      await loadAlerts()
    }
    init()
  }, [router])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      const response = await fetch('/api/alerts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAlerts(data)
      } else {
        console.error('Failed to fetch alerts')
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAlert = async (alert: RideAlert) => {
    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      const response = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: alert.id,
          is_enabled: !alert.is_enabled,
        }),
      })

      if (response.ok) {
        setFeedback({
          type: 'success',
          message: `Alert ${!alert.is_enabled ? 'enabled' : 'disabled'} successfully`,
        })
        await loadAlerts()
      } else {
        const error = await response.json()
        setFeedback({ type: 'error', message: error.error || 'Failed to toggle alert' })
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
      setFeedback({ type: 'error', message: 'Failed to toggle alert' })
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      const response = await fetch(`/api/alerts?id=${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setFeedback({ type: 'success', message: 'Alert deleted successfully' })
        await loadAlerts()
      } else {
        const error = await response.json()
        setFeedback({ type: 'error', message: error.error || 'Failed to delete alert' })
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      setFeedback({ type: 'error', message: 'Failed to delete alert' })
    }
  }

  const activeAlerts = alerts.filter((a) => a.is_enabled)
  const disabledAlerts = alerts.filter((a) => !a.is_enabled)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Ride Alerts</h1>
            <p className="text-gray-600">
              Get notified when rides match your saved routes. {activeAlerts.length}/10 active alerts.
            </p>
          </div>
          <Button
            className="rounded-full"
            onClick={() => {
              setEditingAlert(null)
              setShowCreateModal(true)
            }}
            disabled={activeAlerts.length >= 10}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm mb-6 ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : alerts.length === 0 ? (
          <Card className="p-12 text-center border-2">
            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No alerts yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first alert to get notified when rides match your preferred routes.
            </p>
            <Button
              className="rounded-full"
              onClick={() => {
                setEditingAlert(null)
                setShowCreateModal(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Alerts ({activeAlerts.length})
                </h2>
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onToggle={handleToggleAlert}
                      onDelete={handleDeleteAlert}
                      onEdit={() => {
                        setEditingAlert(alert)
                        setShowCreateModal(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Disabled Alerts */}
            {disabledAlerts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BellOff className="h-5 w-5 text-gray-400" />
                  Disabled Alerts ({disabledAlerts.length})
                </h2>
                <div className="space-y-4">
                  {disabledAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onToggle={handleToggleAlert}
                      onDelete={handleDeleteAlert}
                      onEdit={() => {
                        setEditingAlert(alert)
                        setShowCreateModal(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAlertModal
          alert={editingAlert}
          onClose={() => {
            setShowCreateModal(false)
            setEditingAlert(null)
          }}
          onSuccess={() => {
            setShowCreateModal(false)
            setEditingAlert(null)
            setFeedback({
              type: 'success',
              message: editingAlert ? 'Alert updated successfully' : 'Alert created successfully',
            })
            loadAlerts()
          }}
        />
      )}
    </div>
  )
}

type AlertCardProps = {
  alert: RideAlert
  onToggle: (alert: RideAlert) => void
  onDelete: (alertId: string) => void
  onEdit: () => void
}

function AlertCard({ alert, onToggle, onDelete, onEdit }: AlertCardProps) {
  return (
    <Card className={`p-6 border-2 ${!alert.is_enabled ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {alert.name && (
            <h3 className="font-semibold text-lg mb-2">{alert.name}</h3>
          )}
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
              <span className="text-gray-700">{alert.departure_address}</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
              <span className="text-gray-700">{alert.destination_address}</span>
            </div>
            <div className="text-sm text-gray-500">
              Within {alert.proximity_km} km of route
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => onToggle(alert)}
            title={alert.is_enabled ? 'Disable alert' : 'Enable alert'}
          >
            {alert.is_enabled ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={onEdit}
            title="Edit alert"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(alert.id)}
            title="Delete alert"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

type CreateAlertModalProps = {
  alert: RideAlert | null
  onClose: () => void
  onSuccess: () => void
}

function CreateAlertModal({ alert, onClose, onSuccess }: CreateAlertModalProps) {
  const [formData, setFormData] = useState({
    name: alert?.name || '',
    departure: alert?.departure_address || '',
    destination: alert?.destination_address || '',
    proximityKm: alert?.proximity_km || 20,
  })
  const [departureSuggestions, setDepartureSuggestions] = useState<GeocodeResult[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<GeocodeResult[]>([])
  const [showDepartureSuggestions, setShowDepartureSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [departureLocation, setDepartureLocation] = useState<GeocodeResult | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<GeocodeResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const departureRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (departureRef.current && !departureRef.current.contains(event.target as Node)) {
        setShowDepartureSuggestions(false)
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.departure.length < 2) {
        setDepartureSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(formData.departure)}`)
        if (response.ok) {
          const data = await response.json()
          setDepartureSuggestions(data.slice(0, 5))
          setShowDepartureSuggestions(true)
        }
      } catch (err) {
        console.error('Autocomplete error:', err)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [formData.departure])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (formData.destination.length < 2) {
        setDestinationSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/geocoding?address=${encodeURIComponent(formData.destination)}`)
        if (response.ok) {
          const data = await response.json()
          setDestinationSuggestions(data.slice(0, 5))
          setShowDestinationSuggestions(true)
        }
      } catch (err) {
        console.error('Autocomplete error:', err)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [formData.destination])

  const handleSubmit = async () => {
    setError('')

    if (!formData.departure || !formData.destination) {
      setError('Both departure and destination are required')
      return
    }

    if (!departureLocation || !destinationLocation) {
      setError('Please select locations from the suggestions')
      return
    }

    setSubmitting(true)

    try {
      const { data: session } = await supabase.auth.getSession()
      const token = session?.session?.access_token

      if (alert) {
        // Update existing alert (name and proximity only)
        const response = await fetch('/api/alerts', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: alert.id,
            name: formData.name || null,
            proximity_km: formData.proximityKm,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to update alert')
        }
      } else {
        // Create new alert
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name || null,
            departure_address: formData.departure,
            departure_lat: departureLocation.lat,
            departure_lon: departureLocation.lon,
            destination_address: formData.destination,
            destination_lat: destinationLocation.lat,
            destination_lon: destinationLocation.lon,
            proximity_km: formData.proximityKm,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to create alert')
        }
      }

      onSuccess()
    } catch (error: any) {
      console.error('Submit error:', error)
      setError(error.message || 'Failed to save alert')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {alert ? 'Edit Alert' : 'Create Alert'}
          </h2>
          <Button variant="ghost" size="sm" className="rounded-full" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Alert Name <span className="text-gray-500">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Weekend trips to Stockholm"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>

          {/* Departure */}
          <LocationInput
            ref={departureRef}
            label="From"
            value={formData.departure}
            placeholder="e.g., Stockholm"
            onChange={(value) => setFormData((prev) => ({ ...prev, departure: value }))}
            onFocus={() => formData.departure.length >= 2 && setShowDepartureSuggestions(true)}
            suggestions={departureSuggestions}
            showSuggestions={showDepartureSuggestions}
            onSelectSuggestion={(suggestion) => {
              setFormData((prev) => ({ ...prev, departure: suggestion.display_name }))
              setDepartureLocation(suggestion)
              setShowDepartureSuggestions(false)
            }}
            disabled={!!alert}
          />

          {/* Destination */}
          <LocationInput
            ref={destinationRef}
            label="To"
            value={formData.destination}
            placeholder="e.g., Gothenburg"
            onChange={(value) => setFormData((prev) => ({ ...prev, destination: value }))}
            onFocus={() => formData.destination.length >= 2 && setShowDestinationSuggestions(true)}
            suggestions={destinationSuggestions}
            showSuggestions={showDestinationSuggestions}
            onSelectSuggestion={(suggestion) => {
              setFormData((prev) => ({ ...prev, destination: suggestion.display_name }))
              setDestinationLocation(suggestion)
              setShowDestinationSuggestions(false)
            }}
            disabled={!!alert}
          />

          {alert && (
            <p className="text-sm text-gray-500">
              Note: Route locations cannot be changed. Delete and create a new alert to change the route.
            </p>
          )}

          {/* Proximity */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Maximum distance from route: {formData.proximityKm} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={formData.proximityKm}
              onChange={(e) => setFormData((prev) => ({ ...prev, proximityKm: Number(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900">
              You&apos;ll be notified when a ride is published where both your departure and destination
              points are within {formData.proximityKm} km of the driver&apos;s route.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 rounded-full"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                alert ? 'Update Alert' : 'Create Alert'
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-full border-2"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

type LocationInputProps = {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  onFocus: () => void
  suggestions: GeocodeResult[]
  showSuggestions: boolean
  onSelectSuggestion: (suggestion: GeocodeResult) => void
  disabled?: boolean
}

const LocationInput = forwardRef<HTMLDivElement, LocationInputProps>(
  ({ label, value, placeholder, onChange, onFocus, suggestions, showSuggestions, onSelectSuggestion, disabled }, ref) => (
    <div className="space-y-2 relative" ref={ref}>
      <label className="text-sm font-medium flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        disabled={disabled}
        className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border-2 border-black rounded-xl shadow-xl mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.display_name}-${index}`}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onSelectSuggestion(suggestion)}
            >
              <div className="font-medium">{suggestion.display_name.split(',')[0]}</div>
              <div className="text-xs text-gray-500">{suggestion.display_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
)

LocationInput.displayName = 'LocationInput'
