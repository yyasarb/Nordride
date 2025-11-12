/* eslint-disable react/no-unescaped-entities */
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | Nordride',
  description: 'Learn how Nordride collects, uses, and protects your personal data.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/" className="text-sm text-gray-600 hover:text-black mb-4 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <Card className="p-8 border-2">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p>
              At Nordride, we take your privacy seriously. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our carpooling platform.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">Information You Provide</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Account Information:</strong> Name, email address, phone number, profile photo</li>
              <li><strong>Profile Details:</strong> Bio, languages, interests, vehicle information</li>
              <li><strong>Ride Information:</strong> Departure and destination locations, dates, times, pricing</li>
              <li><strong>Messages:</strong> Communications between drivers and riders</li>
              <li><strong>Reviews:</strong> Written reviews you provide about other users</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Usage Data:</strong> How you interact with our platform</li>
              <li><strong>Device Information:</strong> Browser type, IP address, device identifiers</li>
              <li><strong>Location Data:</strong> Ride pickup and dropoff locations (when you create or book rides)</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-4">
              <li>To facilitate carpooling connections between drivers and riders</li>
              <li>To process ride bookings and manage your account</li>
              <li>To enable communication through our messaging system</li>
              <li>To calculate routes and display ride information</li>
              <li>To improve our services and develop new features</li>
              <li>To ensure safety and prevent fraud</li>
              <li>To send important service updates and notifications</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Data Sharing and Third Parties</h2>
            <p>We work with trusted service providers to operate Nordride:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Supabase:</strong> Database and authentication services (GDPR compliant)</li>
              <li><strong>Vercel:</strong> Hosting and deployment infrastructure</li>
              <li><strong>OpenRouteService:</strong> Routing and mapping services</li>
              <li><strong>Resend:</strong> Email delivery services</li>
            </ul>
            <p className="mt-4">
              All third-party processors are GDPR-compliant and bound by data processing agreements. We never sell your personal information to third parties.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Your Rights Under GDPR</h2>
            <p>As a user in the EU/EEA, you have the following rights:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Right to Data Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to certain processing activities</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-4">
              You can exercise these rights from your account settings under "Privacy & Data" or by contacting us at privacy@nordride.com.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Data Retention</h2>
            <p className="mb-4">
              We retain your personal information for as long as your account is active. After account deletion, we may retain certain information for legal compliance, dispute resolution, and fraud prevention (typically 30-90 days).
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Message and Chat Data Retention</h3>
            <p className="mb-4">
              <strong>Nordride never uses or analyzes private message content for marketing or profiling purposes.</strong> Your conversations remain private between you and other participants.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="font-semibold mb-2">Chat Message Retention Policy:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Rides:</strong> All messages are retained while the ride is active or pending</li>
                <li><strong>User-Initiated Deletion:</strong> You can delete conversations from your inbox at any time. Deletion only affects your view - the other participant will still see the conversation unless they also delete it.</li>
                <li><strong>Permanent Deletion:</strong> Once both participants delete a conversation, all messages are permanently erased from our database within 24 hours</li>
                <li><strong>Automatic Cleanup:</strong> Messages are automatically deleted after <strong>6 months of inactivity</strong> on completed or cancelled rides (GDPR Article 5(1)(e) - Storage Limitation)</li>
                <li><strong>System Messages:</strong> Ride requests, approvals, and cancellations may be retained for up to 12 months for safety auditing and dispute resolution (legitimate interest)</li>
              </ul>
            </div>
            <p className="mb-4">
              <strong>Your Deletion Rights:</strong> You have full control over your conversations. To delete a chat, open the Messages page, hover over any conversation, and click the delete icon. You'll be asked to confirm before deletion.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Other Data Retention Periods</h3>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Profile Information:</strong> Retained while account is active, deleted 30 days after account deletion</li>
              <li><strong>Ride History:</strong> Retained for 12 months after ride completion for safety and tax records</li>
              <li><strong>Reviews and Ratings:</strong> Retained indefinitely as part of the public trust system (unless user requests erasure under GDPR Article 17)</li>
              <li><strong>Reports and Safety Logs:</strong> Retained for up to 3 years for compliance and safety purposes</li>
              <li><strong>Backup Data:</strong> Deleted data may remain in backup systems for up to 30 days before permanent deletion</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Security</h2>
            <p>
              We implement industry-standard security measures to protect your data, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Children's Privacy</h2>
            <p>
              Nordride is not intended for users under 18 years of age. We do not knowingly collect information from children.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through the platform.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>
              For privacy-related questions or to exercise your rights, contact us at:
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
