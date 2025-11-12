/* eslint-disable react/no-unescaped-entities */
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'About Nordride',
  description: 'Learn about Nordride - the community carpooling platform for Sweden.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-6">About Nordride</h1>

        <Card className="p-8 border-2 mb-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg">
              Nordride connects people who want to share rides and split travel costs across Sweden. We're building a community-based carpooling platform that makes travel more affordable, sustainable, and social.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">What Makes Nordride Different</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Cost-Sharing, Not Profit:</strong> Nordride is for splitting expenses, not making money. We enforce fair pricing to keep rides affordable.</li>
              <li><strong>Community First:</strong> We're building a trusted network of riders and drivers who share journeys and experiences.</li>
              <li><strong>Swedish Focus:</strong> Designed specifically for travel within Sweden, with support for Swedish regulations and local needs.</li>
              <li><strong>Simple & Transparent:</strong> No hidden fees, no complicated rules — just easy ride-sharing.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 my-6">
              <div className="p-4 border-2 rounded-xl">
                <h3 className="text-xl font-bold mb-2">1. Create or Find</h3>
                <p className="text-sm">Drivers offer rides. Riders search for available trips.</p>
              </div>
              <div className="p-4 border-2 rounded-xl">
                <h3 className="text-xl font-bold mb-2">2. Connect</h3>
                <p className="text-sm">Message each other to confirm details and arrange pickup.</p>
              </div>
              <div className="p-4 border-2 rounded-xl">
                <h3 className="text-xl font-bold mb-2">3. Share the Journey</h3>
                <p className="text-sm">Split costs, enjoy the ride, and leave a review.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mt-8 mb-4">Our Values</h2>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Trust:</strong> We verify profiles and encourage honest reviews to build a trusted community.</li>
              <li><strong>Sustainability:</strong> Sharing rides reduces emissions and traffic congestion.</li>
              <li><strong>Affordability:</strong> Fair cost-sharing makes travel accessible to everyone.</li>
              <li><strong>Safety:</strong> We provide tools and guidelines to help users travel safely.</li>
              <li><strong>Respect:</strong> We foster a community based on kindness and mutual respect.</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Legal & Compliance</h2>
            <p>
              Nordride operates as a <strong>facilitator</strong>, not a transport provider. We connect people who want to share rides privately. All rides are non-commercial cost-sharing arrangements in compliance with Swedish transport regulations (Transportstyrelsen).
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              Questions, feedback, or partnership inquiries? We'd love to hear from you:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> hello@nordride.com<br />
              <strong>Support:</strong> support@nordride.com<br />
              <strong>Address:</strong> Nordride AB, Sweden
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
