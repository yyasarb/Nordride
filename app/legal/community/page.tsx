/* eslint-disable react/no-unescaped-entities */
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Community Guidelines | Nordride',
  description: 'Guidelines for respectful behavior and ride etiquette on Nordride.',
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
          ← Back to Home
        </Link>

        <h1 className="font-display text-5xl font-bold mb-6">Community Guidelines</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <Card className="p-8 border-2">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4">Welcome to the Nordride Community!</h2>
            <p>
              Nordride is built on trust, respect, and the joy of shared journeys. These guidelines help ensure everyone has a safe and pleasant experience.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Be Respectful and Kind</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Treat all users with courtesy and respect</li>
              <li>Communicate clearly and politely</li>
              <li>Be patient with delays or changes — things happen!</li>
              <li>Respect personal boundaries and privacy</li>
              <li>No harassment, discrimination, or offensive language</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Be Reliable</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Show up on time for pickups and departures</li>
              <li>If you need to cancel, do it as early as possible</li>
              <li>Keep your profile and contact information up to date</li>
              <li>Respond to messages promptly</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Drive and Ride Safely</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">Drivers</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Always drive safely and follow traffic laws</li>
              <li>Ensure your vehicle is clean and well-maintained</li>
              <li>Don't drive under the influence of alcohol or drugs</li>
              <li>Take breaks on long journeys</li>
              <li>Respect your passengers' comfort and safety</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Riders</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Wear your seatbelt</li>
              <li>Respect the driver's vehicle (no smoking without permission, etc.)</li>
              <li>Don't distract the driver</li>
              <li>If something feels unsafe, speak up politely</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Honest Pricing (No Profiteering)</h2>
            <p>
              Remember: Nordride is for <strong>cost-sharing</strong>, not profit-making.
            </p>
            <ul className="list-disc pl-6 mb-4 mt-2">
              <li>Drivers should charge a fair share of fuel and toll costs</li>
              <li>Don't inflate prices to make money (that's not carpooling!)</li>
              <li>Be transparent about what the cost covers</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Communicate Clearly</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Confirm ride details before departure (time, location, price)</li>
              <li>Discuss preferences upfront (music, pets, smoking, luggage)</li>
              <li>Keep each other informed of any changes</li>
              <li>Be honest about delays or issues</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Reviews and Feedback</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Leave honest, constructive reviews after rides</li>
              <li>Be fair — focus on the experience, not personal attacks</li>
              <li>Remember: reviews help build trust in the community</li>
              <li>If something went wrong, address it respectfully</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Privacy and Personal Information</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Don't share other users' personal information without permission</li>
              <li>Use the platform's messaging system for communication</li>
              <li>Respect each other's privacy</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Report Problems</h2>
            <p>
              If you experience harassment, safety concerns, or violations of these guidelines, please report it immediately:
            </p>
            <ul className="list-disc pl-6 mb-4 mt-2">
              <li>Use the "Report" button on user profiles or rides</li>
              <li>Contact our support team at support@nordride.com</li>
              <li>In emergencies, contact local authorities first</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Consequences</h2>
            <p>
              Violations of these guidelines may result in:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Warning messages</li>
              <li>Temporary account suspension</li>
              <li>Permanent account termination</li>
              <li>Legal action (in severe cases)</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Let's Build a Great Community Together</h2>
            <p>
              Nordride is what we make it. By following these simple guidelines, we can all enjoy safe, pleasant, and friendly rides. Happy travels! 🚗✨
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Questions?</h2>
            <p>
              <strong>Email:</strong> community@nordride.com<br />
              <strong>Address:</strong> Nordride AB, Sweden
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
