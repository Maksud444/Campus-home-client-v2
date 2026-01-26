import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import SessionProvider from '@/components/SessionProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import DesktopLanguageSwitcher from '@/components//Desktoplanguageswitcher'
import MobileLanguageSwitcher from '@/components/MobileLanguageSwitcher'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Campus Egypt - Student Housing & Services',
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
            <DesktopLanguageSwitcher />
            <MobileLanguageSwitcher />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  )
}