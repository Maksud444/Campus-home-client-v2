import type { Metadata } from 'next'
import PrivacyContent from '@/components/legal/PrivacyContent'

export const metadata: Metadata = {
  title: 'Privacy Policy | Baytino - Student Housing Egypt',
  description: 'Learn how Baytino collects, uses, and protects your personal information when you use our student housing platform in Egypt.',
  keywords: 'Baytino privacy policy, student housing Egypt, data protection',
  openGraph: {
    title: 'Privacy Policy | Baytino',
    description: 'How Baytino protects your personal information.',
    url: 'https://baytino.com/privacy-policy',
    siteName: 'Baytino',
    type: 'website',
  },
  alternates: {
    canonical: 'https://baytino.com/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  return <PrivacyContent />
}
