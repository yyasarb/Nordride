import Link from 'next/link'
import { Car, Users, Clock, Heart, Shield, DollarSign, MessageCircle, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Carpooling Guide & Etiquette | Nordride',
  description: 'Learn the best practices for safe and enjoyable carpooling on Nordride',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Carpooling Etiquette & Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Making every ride safe, respectful, and enjoyable for everyone
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-2">
                Our Community Values
              </h2>
              <p className="text-blue-800">
                Nordride connects travelers to share rides and costs. Our community thrives on mutual respect,
                punctuality, and clear communication. By following these guidelines, you help create a positive
                experience for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* If You're Driving */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-xl">
              <Car className="h-6 w-6 text-green-700" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">If You're Driving</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Clock,
                title: 'Be Punctual',
                description: 'Arrive on time at the pickup location. If you're running late, notify your passengers immediately via the in-app chat.',
              },
              {
                icon: Car,
                title: 'Keep Your Vehicle Clean & Safe',
                description: 'Ensure your car is clean, well-maintained, and safe to drive. Check tire pressure, fuel levels, and basic maintenance before long trips.',
              },
              {
                icon: CheckCircle,
                title: 'Accurate Trip Details',
                description: 'Provide accurate information about your vehicle, departure time, route, and any stops. Don't make unauthorized route changes without consulting passengers.',
              },
              {
                icon: DollarSign,
                title: 'Fair Cost Sharing',
                description: 'Only charge what's needed to cover fuel and tolls. Nordride is for sharing costs, not making profit. Be transparent about your pricing.',
              },
              {
                icon: MessageCircle,
                title: 'Communicate Clearly',
                description: 'Respond to booking requests promptly (within 24 hours). Be clear about your preferences (music, conversation, pets, etc.) in your ride listing.',
              },
              {
                icon: Heart,
                title: 'Be Respectful & Friendly',
                description: 'Create a welcoming atmosphere. Respect your passengers' personal space and comfort. Keep conversations appropriate and inclusive.',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-green-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-2 rounded-lg flex-shrink-0">
                    <item.icon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* If You're Joining */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">If You're Joining a Ride</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: Clock,
                title: 'Be On Time',
                description: 'Arrive at the pickup location 5 minutes early. If you're running late or need to cancel, inform the driver immediately. Repeated no-shows may result in suspension.',
              },
              {
                icon: Heart,
                title: 'Respect the Car & Driver',
                description: 'Treat the vehicle with care—no eating messy foods, smoking (unless agreed), or loud behavior. Ask permission before eating, vaping, or making calls.',
              },
              {
                icon: DollarSign,
                title: 'Pay as Agreed',
                description: 'Pay the driver using the agreed method (Swish or cash) at the end of the trip. Have the exact amount ready. Don't try to negotiate after the ride.',
              },
              {
                icon: CheckCircle,
                title: 'Follow House Rules',
                description: 'Respect the driver's preferences listed in the ride details (music, conversation level, pets, luggage). If you have special needs, discuss them before booking.',
              },
              {
                icon: MessageCircle,
                title: 'Communicate Proactively',
                description: 'Provide clear pickup location details. If plans change, notify the driver immediately. Keep your phone accessible in case the driver needs to reach you.',
              },
              {
                icon: Shield,
                title: 'Safety First',
                description: 'Wear your seatbelt at all times. If you feel unsafe during the ride, politely ask to be dropped off at a public place and report the issue through the app.',
              },
            ].map((item, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consequences */}
        <section className="mb-12">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              What Happens If Rules Are Broken?
            </h2>
            <div className="space-y-3 text-red-800">
              <div className="flex items-start gap-3">
                <span className="text-red-600 font-bold">•</span>
                <p><strong>No-shows or late arrivals (3+ times):</strong> Temporary suspension for 3 weeks.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-600 font-bold">•</span>
                <p><strong>Inappropriate behavior or harassment:</strong> Immediate permanent ban.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-600 font-bold">•</span>
                <p><strong>Late cancellations (within 2 hours):</strong> Warning and potential restrictions.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-600 font-bold">•</span>
                <p><strong>Price gouging or scamming:</strong> Permanent ban and possible legal action.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {[
              {
                q: 'What if the driver or rider is late?',
                a: 'Communicate immediately via the app chat. If someone is consistently late (15+ minutes) without notice, you can report them after the trip.',
              },
              {
                q: 'Can I cancel a ride after booking?',
                a: 'Yes, but please give as much notice as possible. Cancellations within 2 hours of departure may result in penalties. Frequent last-minute cancellations lead to suspension.',
              },
              {
                q: 'What if I feel unsafe during a ride?',
                a: 'Your safety is our top priority. Politely ask to be dropped off at a safe public location and report the issue immediately through the app's "Report Ride" feature.',
              },
              {
                q: 'How should payment be handled?',
                a: 'Drivers specify their preferred payment method (Swish or cash) when creating the ride. Payment is typically made at the end of the trip. Always pay the agreed amount.',
              },
              {
                q: 'What if the driver changes the route without asking?',
                a: 'Small detours are normal, but major route changes should be discussed with passengers first. If you experience unauthorized changes, report it after the trip.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Carpooling?</h2>
          <p className="text-lg mb-6 text-blue-100">
            Join our community of respectful travelers sharing rides across the Nordics.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/rides/search" className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Find a Ride
            </Link>
            <Link href="/rides/create" className="bg-blue-700 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors border-2 border-white">
              Offer a Ride
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Have questions or concerns? <Link href="/contact" className="text-primary underline">Contact our support team</Link></p>
        </div>
      </div>
    </div>
  )
}
