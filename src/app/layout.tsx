import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import SessionProvider from '@/components/SessionProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import DesktopLanguageSwitcher from '@/components//Desktoplanguageswitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Baytino - Student Housing & Services',
  description: 'Find student housing, roommates, and essential services in Egypt',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <LanguageProvider>
            <Navbar />
            {/* Desktop only language switcher */}
            <DesktopLanguageSwitcher />
            {/* Mobile bottom nav (includes language) */}
            <MobileBottomNav />
            {/* pb-16 on mobile for bottom nav clearance */}
            <main className="pt-16 min-h-screen pb-16 md:pb-0">
              {children}
            </main>
            <Footer />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}