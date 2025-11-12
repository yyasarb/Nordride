import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { CookieConsent } from '@/components/cookie-consent'
import { SmoothScroll } from '@/components/smooth-scroll'
import '@/styles/theme.css'
import '@/styles/globals.css'
import '@/styles/nordride-brand-system.css'
import '@/styles/homepage-styles.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans'
})

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif-display'
})

export const metadata: Metadata = {
  title: 'Nordride - Sustainable Ride Sharing in the Nordics',
  description: 'Free, community-driven ride sharing platform for sustainable travel across the Nordic countries.',
  keywords: 'ride sharing, carpooling, Sweden, Nordic, sustainable travel',
  authors: [{ name: 'Nordride' }],
  openGraph: {
    title: 'Nordride - Sustainable Ride Sharing',
    description: 'Share rides, reduce emissions, build community',
    type: 'website',
    locale: 'en_US',
    url: 'https://nordride.se',
    siteName: 'Nordride',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nordride - Sustainable Ride Sharing',
    description: 'Share rides, reduce emissions, build community',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${dmSerifDisplay.variable} font-sans antialiased flex flex-col min-h-screen bg-white`}>
        <Providers>
          <SmoothScroll>
            <SiteHeader />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <SiteFooter />
            <Toaster />
            <CookieConsent />
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  )
}
