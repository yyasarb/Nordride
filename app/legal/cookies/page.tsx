/* eslint-disable react/no-unescaped-entities */
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Cookie Policy | Nordride',
  description: 'Learn about how Nordride uses cookies and tracking technologies.',
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
          ← Back to Home
        </Link>

        <h1 className="font-display text-5xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <Card className="p-8 border-2">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, keep you logged in, and improve your experience on Nordride.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Cookies</h2>

            <h3 className="text-xl font-semibold mt-6 mb-3">Essential Cookies (Always Active)</h3>
            <p>These cookies are necessary for the platform to function:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Authentication:</strong> Keep you logged in to your account</li>
              <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
              <li><strong>Session Management:</strong> Remember your actions during a session</li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              You cannot disable essential cookies, as they're required for basic functionality.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Functional Cookies (Optional)</h3>
            <p>These cookies enhance your experience:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Preferences:</strong> Remember your language, currency, and display settings</li>
              <li><strong>Forms:</strong> Save information you've entered in forms</li>
              <li><strong>User Interface:</strong> Remember UI customizations</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Analytics Cookies (Optional)</h3>
            <p>These help us understand how you use Nordride:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage Patterns:</strong> Which pages you visit and how long you stay</li>
              <li><strong>Performance:</strong> Identify errors and slow-loading pages</li>
              <li><strong>Improvements:</strong> Help us make Nordride better</li>
            </ul>
            <p className="text-sm text-gray-600 italic mt-2">
              We use anonymized analytics data and do not track personal browsing behavior outside Nordride.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Third-Party Cookies</h2>
            <p>Some features on Nordride use services from trusted third parties:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Vercel:</strong> Hosting and performance monitoring</li>
              <li><strong>OpenRouteService:</strong> Map tiles and routing (may set cookies for map functionality)</li>
            </ul>
            <p>
              These third parties have their own privacy policies. We recommend reviewing them if you're concerned about their data practices.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Your Cookie Choices</h2>
            <p>You have control over cookies:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Cookie Consent Banner:</strong> Accept or decline optional cookies when you first visit</li>
              <li><strong>Update Preferences:</strong> Change your cookie settings anytime from the footer</li>
              <li><strong>Browser Settings:</strong> Most browsers let you block or delete cookies</li>
            </ul>
            <p className="mt-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <strong>Note:</strong> Blocking cookies may affect your experience on Nordride. Essential cookies are required for the platform to work properly.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">How to Manage Cookies in Your Browser</h2>
            <p>Most browsers allow you to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>View and delete cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies (not recommended for Nordride)</li>
              <li>Clear cookies when you close your browser</li>
            </ul>
            <p className="mt-4">
              Learn more about cookie management:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Compliance with GDPR and ePrivacy</h2>
            <p>
              Our cookie practices comply with:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>EU General Data Protection Regulation (GDPR)</li>
              <li>Swedish Electronic Communications Act (ePrivacy Directive)</li>
              <li>EU ePrivacy Regulation requirements</li>
            </ul>
            <p>
              We only set non-essential cookies after obtaining your explicit consent through our cookie banner.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in technology or regulations. Check this page periodically for updates.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Questions?</h2>
            <p>
              If you have questions about how we use cookies, contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> privacy@nordride.com<br />
              <strong>Address:</strong> Nordride AB, Sweden
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
