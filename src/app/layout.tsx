import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import SessionProvider from '@/components/SessionProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import DesktopLanguageSwitcher from '@/components//Desktoplanguageswitcher'

const inter = Inter({ subsets: ['latin'] })

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID

export const metadata: Metadata = {
  title: {
    default: 'Baytino – Student Housing Egypt',
    template: '%s | Baytino',
  },
  description: 'Find affordable student housing, apartments, and roommates in Egypt. Browse listings in Cairo, Alexandria and more.',
  keywords: ['student housing egypt', 'apartments cairo', 'roommates egypt', 'baytino', 'شقق للطلاب', 'سكن الطلاب مصر'],
  authors: [{ name: 'Baytino' }],
  metadataBase: new URL('https://baytino.com'),
  openGraph: {
    title: 'Baytino – Student Housing Egypt',
    description: 'Find affordable student housing, apartments, and roommates in Egypt.',
    url: 'https://baytino.com',
    siteName: 'Baytino',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baytino – Student Housing Egypt',
    description: 'Find affordable student housing, apartments, and roommates in Egypt.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: 'OJzX_z6TELYWg-MgnmkkYT74kvQVwzzadFW5nbg4LAg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Baytino',
    url: 'https://baytino.com',
    description: 'Find affordable student housing, apartments, and roommates in Egypt.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: 'https://baytino.com/properties?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  }

  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Baytino',
    url: 'https://baytino.com',
    logo: 'https://baytino.com/logo.png',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Arabic'],
    },
  }

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://student-housing-backend.vercel.app" />

        {/* Google Analytics 4 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity */}
        {CLARITY_ID && (
          <Script id="clarity-init" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");
            `}
          </Script>
        )}
      </head>
      <body className={inter.className}>
        {/* JSON-LD: WebSite + Organization schemas */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }} />
        <SessionProvider>
          <LanguageProvider>
            <NotificationProvider>
              <Navbar />
              {/* Desktop only language switcher */}
              <DesktopLanguageSwitcher />
              {/* Mobile bottom nav (includes language) */}
              <MobileBottomNav />
              {/* pb-16 on mobile for bottom nav clearance */}
              <main className="pt-[112px] md:pt-16 min-h-screen pb-20 md:pb-0">
                {children}
              </main>
              <Footer />
            </NotificationProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
