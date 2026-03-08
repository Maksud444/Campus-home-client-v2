import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Baytino',
  robots: { index: false, follow: false },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}