import type { Metadata } from 'next'
import { DM_Sans, Space_Grotesk } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { Providers } from '@/components/providers'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import '@/styles/globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans'
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk'
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
      <body className={`${dmSans.variable} ${spaceGrotesk.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <Providers>
          <SiteHeader />
          <main className="pt-20 flex-1">
            {children}
          </main>
          <SiteFooter />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
