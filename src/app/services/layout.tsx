import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Services in Egypt – Moving, Cleaning & More',
  description: 'Find trusted student services in Egypt: movers, cleaners, internet setup, furniture rental, airport pickup, and more. Verified providers in Cairo and beyond.',
  keywords: [
    'student services Egypt', 'moving services Cairo', 'cleaning services Egypt',
    'airport pickup Cairo', 'furniture rental Egypt', 'internet setup Cairo',
    'services for students Egypt', 'خدمات الطلاب مصر', 'خدمات القاهرة',
  ],
  alternates: { canonical: 'https://baytino.com/services' },
  openGraph: {
    title: 'Student Services in Egypt | Baytino',
    description: 'Trusted moving, cleaning, internet, and lifestyle services for students in Egypt.',
    url: 'https://baytino.com/services',
    images: [{ url: 'https://baytino.com/og-image.png', width: 1200, height: 630 }],
  },
}

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
