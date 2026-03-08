import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create a Post | Baytino',
  description: 'List your property, room, or find a roommate on Baytino – Egypt\'s student housing platform.',
  robots: { index: false, follow: false },
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
