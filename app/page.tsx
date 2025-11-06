'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  MapPin, Users, MessageCircle, Shield, ArrowRight,
  Search, Calendar, User, Heart, Sparkles, Star,
  ChevronDown, CheckCircle, Leaf
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

// Popular routes with real data feel
const POPULAR_ROUTES = [
  { from: 'Stockholm', to: 'Gothenburg', distance: '470 km', price: '280 kr', riders: 156, time: '5h 30m' },
  { from: 'Stockholm', to: 'Malmö', distance: '610 km', price: '350 kr', riders: 98, time: '6h 45m' },
  { from: 'Stockholm', to: 'Uppsala', distance: '70 km', price: '75 kr', riders: 234, time: '1h' },
  { from: 'Gothenburg', to: 'Malmö', distance: '280 km', price: '180 kr', riders: 142, time: '3h 15m' },
]

// Success stories with personality
const STORIES = [
  {
    name: 'Emma & Lucas',
    route: 'Stockholm → Gothenburg',
    quote: 'Started as ride-share buddies, now we grab fika every month!',
    image: '👥',
    impact: 'New friendship'
  },
  {
    name: 'Sofia',
    route: 'Uppsala → Stockholm',
    quote: 'Saved 12,000 kr this year. Plus met some amazing people.',
    image: '💰',
    impact: 'Smart savings'
  },
  {
    name: 'Erik',
    route: 'Malmö → Copenhagen',
    quote: 'No more boring commutes. Every ride is a mini-adventure.',
    image: '✨',
    impact: 'Daily joy'
  }
]

// How it works steps
const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Find your match',
    description: 'Search by destination, check profiles, read reviews',
    icon: <Search className="w-8 h-8" />,
    color: 'from-orange-400 to-pink-400'
  },
  {
    step: 2,
    title: 'Connect & plan',
    description: 'Chat directly, agree on meeting point and time',
    icon: <MessageCircle className="w-8 h-8" />,
    color: 'from-blue-400 to-cyan-400'
  },
  {
    step: 3,
    title: 'Share the journey',
    description: 'Split costs, share stories, maybe make a friend',
    icon: <Heart className="w-8 h-8" />,
    color: 'from-purple-400 to-pink-400'
  }
]

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [searchFrom, setSearchFrom] = useState('')
  const [searchTo, setSearchTo] = useState('')
  const [hoveredRoute, setHoveredRoute] = useState<number | null>(null)
  const [activeStory, setActiveStory] = useState(0)
  const user = useAuthStore((state) => state.user)
  const { scrollYProgress } = useScroll()

  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // Mouse tracking for playful elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Auto-rotate stories
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % STORIES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 overflow-hidden">
      {/* Playful floating shapes */}
      <motion.div
        className="fixed pointer-events-none inset-0 z-0"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(251, 146, 60, 0.1) 0%, transparent 50%)`
        }}
      />

      {/* Hero Section with Interactive Elements */}
      <motion.section
        className="relative min-h-[90vh] flex items-center justify-center px-6 py-20"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Animated background blobs */}
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Playful badge */}
            <motion.div
              className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-lg mb-6 border-2 border-orange-400"
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                100% Free • No Commissions
              </span>
            </motion.div>

            {/* Main headline with playful emphasis */}
            <h1 className="text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Good company makes{' '}
              <span className="relative inline-block">
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 blur-2xl opacity-30"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="relative bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  every journey
                </span>
              </span>{' '}
              better
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Share rides across Sweden. Split costs, swap stories, maybe grab a fika.
              Real people, real conversations, real connections. 🚗💫
            </p>

            {/* Interactive search preview */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6 mb-6 border-2 border-gray-100"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <input
                    type="text"
                    placeholder="From? (e.g., Stockholm)"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="flex-1 text-lg font-medium outline-none"
                  />
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <input
                    type="text"
                    placeholder="To? (e.g., Gothenburg)"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="flex-1 text-lg font-medium outline-none"
                  />
                </div>
              </div>

              <Link href="/rides/search">
                <motion.button
                  className="w-full mt-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-lg"
                  whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(251, 146, 60, 0.3)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Search className="w-5 h-5" />
                  Find your ride
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Verified profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Secure messaging</span>
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-500" />
                <span>Eco-friendly</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Playful illustration area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Floating stats cards */}
            <motion.div
              className="absolute -top-10 -left-10 bg-white rounded-2xl shadow-xl p-4 border-2 border-orange-200"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="text-3xl font-bold text-orange-500">12.4M</div>
              <div className="text-sm text-gray-600">Rides shared</div>
            </motion.div>

            <motion.div
              className="absolute top-10 -right-10 bg-white rounded-2xl shadow-xl p-4 border-2 border-blue-200"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="text-3xl font-bold text-blue-500">98%</div>
              <div className="text-sm text-gray-600">Happy travelers</div>
            </motion.div>

            {/* Main illustration placeholder */}
            <div className="relative bg-gradient-to-br from-orange-100 to-pink-100 rounded-3xl p-12 aspect-square flex items-center justify-center border-2 border-orange-200">
              <motion.div
                className="text-9xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                🚗
              </motion.div>
              <motion.div
                className="absolute top-1/4 right-1/4 text-5xl"
                animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                💬
              </motion.div>
              <motion.div
                className="absolute bottom-1/4 left-1/4 text-5xl"
                animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                ☕
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Popular Routes - Uber-style cards */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">
              Popular routes right now
            </h2>
            <p className="text-xl text-gray-600">
              Join travelers heading your way
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {POPULAR_ROUTES.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                onHoverStart={() => setHoveredRoute(index)}
                onHoverEnd={() => setHoveredRoute(null)}
              >
                <Link href={`/rides/search?from=${route.from}&to=${route.to}`}>
                  <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 hover:border-orange-400 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <span className="font-semibold text-lg">{route.from}</span>
                      </div>
                      <ArrowRight className={`w-6 h-6 transition-transform ${hoveredRoute === index ? 'translate-x-2' : ''}`} />
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <span className="font-semibold text-lg">{route.to}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{route.distance} • {route.time}</span>
                      <span className="font-semibold text-orange-500 text-lg">{route.price}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{route.riders} travelers this month</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Playful steps */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to better journeys
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100 hover:border-purple-400 transition-all">
                  <motion.div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {step.icon}
                  </motion.div>

                  <div className="text-sm font-semibold text-gray-400 mb-2">
                    Step {step.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connecting line */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-200 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - Carousel */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4">
              Real stories from real travelers
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands who&apos;ve made the journey better
            </p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStory}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-3xl p-12 border-2 border-orange-200"
              >
                <div className="text-7xl mb-6">{STORIES[activeStory].image}</div>
                <p className="text-2xl font-medium mb-6 leading-relaxed">
                  &quot;{STORIES[activeStory].quote}&quot;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">
                      {STORIES[activeStory].name}
                    </div>
                    <div className="text-gray-600">
                      {STORIES[activeStory].route}
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-full text-sm font-semibold text-orange-500">
                    {STORIES[activeStory].impact}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Story indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {STORIES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStory(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeStory ? 'w-8 bg-orange-500' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Bold and playful */}
      {!user && (
        <section className="py-20 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden"
          >
            {/* Animated background pattern */}
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />

            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="text-6xl mb-6"
              >
                ✨
              </motion.div>

              <h2 className="text-5xl font-bold mb-6">
                Your next adventure awaits
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join 12.4M travelers who chose connection over convenience
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <motion.button
                    className="bg-white text-orange-500 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get started free
                  </motion.button>
                </Link>
                <Link href="/rides/search">
                  <motion.button
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg"
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse rides
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      )}
    </div>
  )
}
