import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Housing & Apartments in Egypt',
  description: 'Browse verified student apartments, rooms, and roommates in Cairo, Alexandria, Giza and across Egypt. Filter by price, location, amenities, and more.',
  keywords: [
    'student housing Egypt', 'apartments for rent Cairo', 'student apartments Cairo',
    'rooms for rent Egypt', 'find roommate Cairo', 'شقق للطلاب مصر', 'سكن الطلاب القاهرة',
    'furnished apartments Cairo students', 'affordable housing Egypt', 'student accommodation Egypt',
    'apartments Alexandria Egypt', 'cheap rooms Cairo', 'international student housing Egypt',
  ],
  alternates: { canonical: 'https://baytino.com/properties' },
  openGraph: {
    title: 'Student Housing & Apartments in Egypt | Baytino',
    description: 'Browse verified student apartments, rooms, and roommates in Cairo, Alexandria, and across Egypt.',
    url: 'https://baytino.com/properties',
    images: [{ url: 'https://baytino.com/og-image.png', width: 1200, height: 630 }],
  },
}

export default function PropertiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
