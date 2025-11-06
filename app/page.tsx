'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin, Users, MessageCircle, Shield, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

// FAQ data based on implementation guide
const FAQ_DATA = [
  {
    question: "What makes NordRide different from other platforms?",
    answer: "We're built for connection, not just transportation. NordRide prioritizes the human side of travel—shared conversations, cultural exchange, and genuine companionship. We're a community platform, not a corporate service, with 100% free membership and no commissions. Every ride makes our Swedish travel community stronger."
  },
  {
    question: "Is this legal in Sweden?",
    answer: "Absolutely. Cost-sharing rides (samåkning) is legal in Sweden as long as you're genuinely sharing travel costs, not making profit. NordRide ensures pricing stays within legal limits—we cap costs at 80% of the maximum legal rate calculated by distance. You're simply splitting expenses with fellow travelers."
  },
  {
    question: "How does pricing work?",
    answer: "Drivers set prices based on actual costs: fuel, wear, tolls, and parking. Our system suggests fair prices (80% of legal maximum) and prevents overcharging. For passengers, you see the total cost upfront—no hidden fees, no commissions, no surprises. Just honest cost-sharing."
  },
  {
    question: "Who can see my profile and messages?",
    answer: "Your profile is visible to other verified NordRide members. Private messages are encrypted and only visible to you and the person you're chatting with. We never share your data with third parties. You control your information and can delete your account anytime—full GDPR compliance."
  },
  {
    question: "What if I need to cancel?",
    answer: "Life happens. Drivers can cancel rides anytime (though frequent cancellations affect your rating). Passengers can cancel approved bookings—the seat becomes available again immediately. Communication is key: let your travel companions know as early as possible through our messaging system."
  },
  {
    question: "How do I know who I'm riding with?",
    answer: "Every member verifies their email. You can see profiles with photos, languages spoken, ride history, and reviews from other travelers. Read what others say about potential travel companions. Our review system is transparent and honest—building trust through community feedback."
  },
  {
    question: "What about safety?",
    answer: "Your safety matters. We require email verification, transparent profiles, and authentic reviews. All messages stay within our platform until you approve a ride. Report any concerning behavior immediately—we take violations seriously and act quickly. Trust your instincts, read reviews, and communicate clearly."
  },
  {
    question: "Can I bring luggage or pets?",
    answer: "Each driver sets their own preferences. When creating a ride, drivers specify luggage allowance (small, carry-on, or large bags) and whether pets are welcome (yes, no, or maybe). Filter search results to find rides that match your needs. Always confirm details through messaging before departure."
  },
  {
    question: "What happens after the ride?",
    answer: "After arrival, both driver and passengers confirm trip completion in the system. Then you can leave honest reviews about your experience. Reviews help build community trust and guide other travelers. Share what made the journey memorable—the conversation, the playlist, the coffee stops."
  }
]

// Popular routes data
const POPULAR_ROUTES = [
  { from: 'Stockholm', to: 'Gothenburg', distance: '470 km', rides: 12 },
  { from: 'Stockholm', to: 'Malmö', distance: '610 km', rides: 8 },
  { from: 'Stockholm', to: 'Uppsala', distance: '70 km', rides: 15 },
  { from: 'Gothenburg', to: 'Malmö', distance: '280 km', rides: 10 },
  { from: 'Malmö', to: 'Copenhagen', distance: '30 km', rides: 18 },
  { from: 'Uppsala', to: 'Linköping', distance: '150 km', rides: 6 }
]

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="faq-item-nordride">
      <button
        className="faq-item-nordride__question"
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question}`}
      >
        <span>{question}</span>
        <ChevronDown className="faq-item-nordride__icon" />
      </button>
      <div
        id={`faq-answer-${question}`}
        className="faq-item-nordride__answer"
        aria-hidden={!isOpen}
      >
        <p>{answer}</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-nordride">
        {/* Background organic shapes */}
        <div className="organic-shape organic-shape--blob" style={{ top: '-100px', right: '10%' }} />
        <div className="organic-shape organic-shape--blob" style={{ bottom: '-80px', left: '15%', width: '250px', height: '250px' }} />

        <div className="hero-nordride__container">
          <div className={`hero-nordride__content animate-on-scroll ${isVisible ? 'is-visible' : ''}`}>
            <div className="hero-nordride__badge">
              100% Free • No Commissions
            </div>

            <h1 className="hero-nordride__title" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--font-display)',
              color: 'var(--color-charcoal)',
              lineHeight: '1.1',
              letterSpacing: '-0.02em',
              maxWidth: '600px',
              marginBottom: 'var(--space-lg)'
            }}>
              Good company makes every journey better
            </h1>

            <p className="hero-nordride__subtitle">
              Find rides across Sweden. Share costs, stories, and maybe a coffee stop. Real people, real conversations, real connections.
            </p>

            <div className="hero-nordride__cta">
              <Link
                href="/rides/search"
                className="btn-nordride btn-nordride--primary"
                style={{
                  background: 'var(--color-terracotta)',
                  color: 'white',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '16px 40px',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease'
                }}
              >
                Find your ride
              </Link>

              <Link
                href="/rides/create"
                className="btn-nordride btn-nordride--secondary"
                style={{
                  background: 'transparent',
                  border: '2px solid var(--color-sage)',
                  color: 'var(--color-sage)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '16px',
                  fontWeight: '600',
                  padding: '14px 38px',
                  borderRadius: '28px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease'
                }}
              >
                Offer a ride
              </Link>
            </div>
          </div>

          <div className={`hero-nordride__illustration animate-on-scroll animate-on-scroll--delay-2 ${isVisible ? 'is-visible' : ''}`}>
            {/* Placeholder for illustration - using simple icon layout */}
            <div style={{
              position: 'relative',
              height: '500px',
              borderRadius: '20px',
              background: 'var(--color-soft-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--color-light-gray)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '120px', marginBottom: '20px' }}>🚗</div>
                <p style={{ color: 'var(--color-sage)', fontWeight: '600', fontSize: '18px' }}>
                  Travel Together, Share Stories
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-nordride">
        <div className="features-nordride__container">
          <h2 className="features-nordride__title">
            Why travelers choose NordRide
          </h2>

          <div className="features-nordride__grid">
            {/* Feature 1: Community-Driven */}
            <div className={`feature-card-nordride animate-on-scroll ${isVisible ? 'is-visible' : ''}`}>
              <Users className="feature-card-nordride__icon" style={{ color: 'var(--color-terracotta)' }} />
              <h3 className="feature-card-nordride__title">
                Built by travelers, for travelers
              </h3>
              <p className="feature-card-nordride__text">
                No corporate middleman. Just real people sharing journeys across Sweden and beyond. Every ride strengthens our community.
              </p>
            </div>

            {/* Feature 2: Connection Over Efficiency */}
            <div className={`feature-card-nordride animate-on-scroll animate-on-scroll--delay-1 ${isVisible ? 'is-visible' : ''}`}>
              <MessageCircle className="feature-card-nordride__icon" style={{ color: 'var(--color-sage)' }} />
              <h3 className="feature-card-nordride__title">
                Share more than just the ride
              </h3>
              <p className="feature-card-nordride__text">
                Every journey is a chance for good conversation. Meet fellow travelers, share stories, maybe find a friend. Connection makes the kilometers disappear.
              </p>
            </div>

            {/* Feature 3: Safe & Trusted */}
            <div className={`feature-card-nordride animate-on-scroll animate-on-scroll--delay-2 ${isVisible ? 'is-visible' : ''}`}>
              <Shield className="feature-card-nordride__icon" style={{ color: 'var(--color-terracotta)' }} />
              <h3 className="feature-card-nordride__title">
                Verified profiles, real reviews
              </h3>
              <p className="feature-card-nordride__text">
                Email verification, transparent reviews, and secure messaging. Travel with people who are exactly who they say they are. Trust built through transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section className="metrics-nordride">
        <div className="metrics-nordride__container">
          <h2 className="metrics-nordride__title">
            Built on connections, measured in smiles
          </h2>

          <div className="metrics-nordride__grid">
            {/* Metric 1 */}
            <div className={`metric-card-nordride animate-on-scroll ${isVisible ? 'is-visible' : ''}`}>
              <div className="metric-card-nordride__decoration" />
              <div className="metric-card-nordride__number">12.4M</div>
              <div className="metric-card-nordride__label">Rides shared</div>
              <div className="metric-card-nordride__description">
                Every journey builds our community stronger
              </div>
            </div>

            {/* Metric 2 */}
            <div className={`metric-card-nordride metric-card-nordride--sage animate-on-scroll animate-on-scroll--delay-1 ${isVisible ? 'is-visible' : ''}`}>
              <div className="metric-card-nordride__decoration" />
              <div className="metric-card-nordride__number">98%</div>
              <div className="metric-card-nordride__label">Arrive with a smile</div>
              <div className="metric-card-nordride__description">
                Shared rides create shared joy
              </div>
            </div>

            {/* Metric 3 */}
            <div className={`metric-card-nordride animate-on-scroll animate-on-scroll--delay-2 ${isVisible ? 'is-visible' : ''}`}>
              <div className="metric-card-nordride__decoration" />
              <div className="metric-card-nordride__number">2.8M kg</div>
              <div className="metric-card-nordride__label">CO₂ saved together</div>
              <div className="metric-card-nordride__description">
                Good for people, good for planet
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="routes-nordride">
        <div className="routes-nordride__container">
          <div className="routes-nordride__header">
            <h2 className="routes-nordride__title">
              Start your next journey
            </h2>
            <p className="routes-nordride__subtitle">
              Popular routes travelers are sharing right now
            </p>
          </div>

          <div className="routes-nordride__grid">
            {POPULAR_ROUTES.map((route, index) => (
              <Link
                key={index}
                href={`/rides/search?from=${route.from}&to=${route.to}`}
                className={`route-card-nordride animate-on-scroll animate-on-scroll--delay-${Math.min(index % 3, 2)} ${isVisible ? 'is-visible' : ''}`}
              >
                <MapPin className="route-card-nordride__icon" />
                <div className="route-card-nordride__route">
                  {route.from}
                  <span className="route-card-nordride__arrow">→</span>
                  {route.to}
                </div>
                <div className="route-card-nordride__distance">{route.distance}</div>
                <div className="route-card-nordride__badge">
                  {route.rides} rides available
                </div>
                <div className="route-card-nordride__indicator">
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-nordride">
        <div className="faq-nordride__container">
          <h2 className="faq-nordride__title">
            Questions? We&apos;ve got answers
          </h2>

          <div>
            {FAQ_DATA.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      {!user && (
        <section className="cta-banner-nordride">
          <div className="cta-banner-nordride__container">
            <h2 className="cta-banner-nordride__title">
              Your next journey starts here
            </h2>
            <p className="cta-banner-nordride__subtitle">
              Join thousands of travelers sharing costs, stories, and Sweden&apos;s roads
            </p>
            <div className="cta-banner-nordride__buttons">
              <Link
                href="/rides/search"
                className="btn-nordride btn-nordride--inverted"
              >
                Find a ride
              </Link>
              <Link
                href="/about"
                className="btn-nordride btn-nordride--ghost-white"
              >
                Learn more
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
