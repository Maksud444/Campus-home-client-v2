import type { Metadata } from 'next'
import TermsContent from '@/components/legal/TermsContent'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Baytino - Student Housing Egypt',
  description: 'Read the Terms & Conditions governing your use of Baytino, the student housing platform in Egypt.',
  keywords: 'Baytino terms and conditions, student housing Egypt, terms of service',
  openGraph: {
    title: 'Terms & Conditions | Baytino',
    description: 'Terms governing your use of the Baytino student housing platform.',
    url: 'https://baytino.com/terms',
    siteName: 'Baytino',
    type: 'website',
  },
  alternates: {
    canonical: 'https://baytino.com/terms',
  },
}

export default function TermsPage() {
  return <TermsContent />
}
