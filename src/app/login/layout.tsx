import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Baytino',
  description: 'Sign in to your Baytino account to manage your listings and find student housing in Egypt.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
