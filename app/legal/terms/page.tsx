/* eslint-disable react/no-unescaped-entities */
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Terms & Conditions | Nordride',
  description: 'Terms and conditions for using the Nordride carpooling platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <Card className="p-8 border-2">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
            <p>
              Welcome to Nordride! By creating an account and using our platform, you agree to these Terms & Conditions. Please read them carefully.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">2. What Nordride Is (and Isn't)</h2>
            <p>
              <strong>Nordride is a facilitator</strong> — we connect people who want to share rides and split travel costs. We are <strong>not a transport provider, taxi service, or commercial operator</strong>.
            </p>
            <p className="mt-4">
              All rides arranged through Nordride are private agreements between individual users. We simply provide the platform to help you find each other.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">3. Cost-Sharing Only (No Profit Allowed)</h2>
            <p className="font-semibold text-lg">
              Nordride is for cost-sharing, not profit-making.
            </p>
            <ul className="list-disc pl-6 mb-4 mt-2">
              <li>Drivers may charge passengers for their share of fuel and tolls</li>
              <li>Prices must be reasonable and based on actual costs</li>
              <li><strong>Making a profit from rides is not allowed</strong> (that would make you a commercial transport operator)</li>
              <li>Nordride enforces maximum pricing based on distance to prevent profiteering</li>
            </ul>
            <p>
              If we detect profit-oriented pricing or commercial activity, your account may be suspended or terminated.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">4. User Responsibilities</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">All Users</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate and truthful information</li>
              <li>Treat other users with respect</li>
              <li>Communicate clearly about ride details</li>
              <li>Honor commitments (show up on time or cancel with notice)</li>
              <li>Report safety concerns or violations</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Drivers</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Hold a valid driver's license</li>
              <li>Maintain proper vehicle insurance</li>
              <li>Ensure vehicle is safe and roadworthy</li>
              <li>Drive safely and follow traffic laws</li>
              <li>Only charge cost-sharing amounts (no profit)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Riders</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Be ready at the agreed pickup time and location</li>
              <li>Pay the agreed amount to the driver</li>
              <li>Respect the driver's vehicle and rules</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">5. Use at Your Own Risk</h2>
            <p className="font-semibold">
              Important: Nordride is not responsible for what happens during rides.
            </p>
            <p className="mt-4">
              Each ride is a private arrangement between users. You participate at your own risk. We do not:
            </p>
            <ul className="list-disc pl-6 mb-4 mt-2">
              <li>Verify driving licenses or insurance</li>
              <li>Inspect vehicles for safety</li>
              <li>Conduct background checks</li>
              <li>Guarantee the behavior of users</li>
              <li>Take responsibility for accidents, injuries, or disputes</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">6. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use Nordride for commercial transport services</li>
              <li>Make a profit from rides</li>
              <li>Harass, threaten, or discriminate against other users</li>
              <li>Post false or misleading information</li>
              <li>Share or sell your account</li>
              <li>Scrape or collect data from the platform</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">7. Content and Reviews</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>Users can leave written reviews after completed trips</li>
              <li>Reviews must be honest and respectful</li>
              <li>We reserve the right to remove inappropriate content</li>
              <li>You retain ownership of content you post, but grant us a license to use it on the platform</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">8. Account Termination</h2>
            <p>
              We may suspend or terminate accounts that violate these Terms, engage in commercial activity, repeatedly cancel rides, or pose safety concerns.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">9. Limitation of Liability</h2>
            <p className="font-semibold">
              Nordride provides the platform "as is" without warranties of any kind.
            </p>
            <p className="mt-4">
              We are not liable for any damages, losses, injuries, or disputes arising from your use of the platform or participation in rides. This includes but is not limited to:
            </p>
            <ul className="list-disc pl-6 mb-4 mt-2">
              <li>Traffic accidents or injuries</li>
              <li>Vehicle damage or mechanical failures</li>
              <li>Lost or stolen property</li>
              <li>Payment disputes between users</li>
              <li>Behavior of other users</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">10. Compliance with Swedish Law</h2>
            <p>
              Nordride operates in accordance with Swedish regulations regarding cost-sharing and non-commercial ride arrangements, as defined by Transportstyrelsen (Swedish Transport Agency).
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">11. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. Continued use of Nordride after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">12. Governing Law</h2>
            <p>
              These Terms are governed by Swedish law. Disputes shall be resolved in Swedish courts.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">13. Contact</h2>
            <p>
              Questions about these Terms? Contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> support@nordride.com<br />
              <strong>Address:</strong> Nordride AB, Sweden
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
