'use client'

import { useState, useEffect } from 'react'

const SWEDISH_FIRST_NAMES = [
  'Emma', 'Maja', 'Sofia', 'Ella', 'Wilma', 'Alice', 'Elsa', 'Olivia', 'Astrid', 'Alva',
  'Oscar', 'Lucas', 'Liam', 'Elias', 'Oliver', 'Hugo', 'Alexander', 'William', 'Filip', 'Viktor'
]

const SWEDISH_LAST_INITIALS = ['A', 'B', 'E', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'S', 'T']

const SWEDISH_CITIES = [
  'Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås', 'Örebro', 'Linköping',
  'Helsingborg', 'Jönköping', 'Norrköping', 'Lund', 'Umeå', 'Gävle', 'Borås',
  'Södertälje', 'Eskilstuna', 'Karlstad', 'Täby', 'Växjö', 'Halmstad'
]

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateRandomSignup() {
  const firstName = getRandomItem(SWEDISH_FIRST_NAMES)
  const lastInitial = getRandomItem(SWEDISH_LAST_INITIALS)
  const city = getRandomItem(SWEDISH_CITIES)

  return {
    name: `${firstName} ${lastInitial}.`,
    city,
  }
}

export function WaitlistNotification() {
  const [visible, setVisible] = useState(false)
  const [currentSignup, setCurrentSignup] = useState(generateRandomSignup())

  useEffect(() => {
    // Random interval between 2-3 minutes (120000-180000ms)
    const getRandomInterval = () => Math.floor(Math.random() * 60000) + 120000

    const showNotification = () => {
      setCurrentSignup(generateRandomSignup())
      setVisible(true)

      // Hide after 4 seconds
      setTimeout(() => {
        setVisible(false)
      }, 4000)
    }

    // Show first notification after 5 seconds (so user has time to see the page)
    const initialTimeout = setTimeout(showNotification, 5000)

    // Then show notifications at random intervals
    let intervalId: NodeJS.Timeout

    const scheduleNext = () => {
      intervalId = setTimeout(() => {
        showNotification()
        scheduleNext()
      }, getRandomInterval())
    }

    // Start scheduling after the initial notification
    setTimeout(() => {
      scheduleNext()
    }, 5000 + 4000) // initial delay + notification duration

    return () => {
      clearTimeout(initialTimeout)
      clearTimeout(intervalId)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 transition-all duration-500 ease-out ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white border-2 border-gray-900 rounded-xl shadow-2xl px-4 py-3 flex items-center gap-3 min-w-[280px]">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {currentSignup.name} from {currentSignup.city}
          </p>
          <p className="text-xs text-gray-600">just joined the waitlist</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
