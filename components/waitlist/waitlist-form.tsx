'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [onlyLocal, setOnlyLocal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; fromCity?: string; toCity?: string }>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: { email?: string; fromCity?: string; toCity?: string } = {}

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // From city validation
    if (!fromCity.trim()) {
      if (onlyLocal) {
        newErrors.fromCity = 'Please enter your home city'
      } else {
        newErrors.fromCity = 'Please enter your departure city'
      }
    }

    // To city validation (only if not local travel)
    if (!onlyLocal && !toCity.trim()) {
      newErrors.toCity = 'Please enter your destination city'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            from_city: fromCity.trim(),
            to_city: onlyLocal ? null : toCity.trim(),
            only_local_travel: onlyLocal
          }
        ])
        .select('waitlist_number')
        .single()

      if (error) {
        if (error.code === '23505') {
          // Duplicate email
          toast({
            title: 'Already on the waitlist',
            description: 'This email is already registered on our waitlist.',
            variant: 'destructive'
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: 'Welcome to the waitlist!',
          description: `You're number ${data.waitlist_number} on the list. Check your email for confirmation.`,
        })

        // Reset form
        setEmail('')
        setFromCity('')
        setToCity('')
        setOnlyLocal(false)
        setErrors({})
      }
    } catch (error) {
      console.error('Error joining waitlist:', error)
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-md">
      {/* Email Field */}
      <div className="mb-6">
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (errors.email) {
              setErrors({ ...errors, email: undefined })
            }
          }}
          placeholder="your@email.com"
          className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all ${
            errors.email ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* From City Field */}
      <div className="mb-6">
        <label htmlFor="fromCity" className="block text-sm font-semibold text-gray-900 mb-2">
          {onlyLocal ? 'Where do you live?' : 'Where do you usually travel from?'} <span className="text-red-500">*</span>
        </label>
        <input
          id="fromCity"
          type="text"
          value={fromCity}
          onChange={(e) => {
            setFromCity(e.target.value)
            if (errors.fromCity) {
              setErrors({ ...errors, fromCity: undefined })
            }
          }}
          placeholder="From: City (e.g., Stockholm)"
          className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all ${
            errors.fromCity ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.fromCity && (
          <p className="mt-2 text-sm text-red-600">{errors.fromCity}</p>
        )}
      </div>

      {/* To City Field */}
      <div className="mb-6">
        <label htmlFor="toCity" className={`block text-sm font-semibold mb-2 ${onlyLocal ? 'text-gray-400' : 'text-gray-900'}`}>
          Where do you usually travel to? {!onlyLocal && <span className="text-red-500">*</span>}
        </label>
        <input
          id="toCity"
          type="text"
          value={toCity}
          onChange={(e) => {
            setToCity(e.target.value)
            if (errors.toCity) {
              setErrors({ ...errors, toCity: undefined })
            }
          }}
          placeholder="To: City (e.g., Gothenburg)"
          disabled={onlyLocal}
          className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/50 transition-all ${
            onlyLocal ? 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60' : errors.toCity ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {errors.toCity && !onlyLocal && (
          <p className="mt-2 text-sm text-red-600">{errors.toCity}</p>
        )}
      </div>

      {/* Checkbox */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={onlyLocal}
            onChange={(e) => {
              setOnlyLocal(e.target.checked)
              if (e.target.checked) {
                setToCity('')
                setErrors({ ...errors, toCity: undefined })
              }
            }}
            className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-black focus:ring-2 focus:ring-black/50 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
            I only travel within my city (less than 50 km)
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-black text-white px-6 py-3.5 rounded-full font-semibold hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-fast shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isSubmitting ? 'Joining...' : 'Join Waitlist →'}
      </button>
    </form>
  )
}
