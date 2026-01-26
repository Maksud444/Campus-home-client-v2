'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Only run redirect logic once
    if (redirecting) return
    
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user && !redirecting) {
      setRedirecting(true)
      
      // Redirect with user ID in URL
      const role = (session.user as any).role || 'student'
      const userId = session.user.id || session.user.email?.split('@')[0]
      
      console.log('🔄 Redirecting to:', `/dashboard/${role}/${userId}`)
      
      // Use replace instead of push to avoid back button issues
      router.replace(`/dashboard/${role}/${userId}`)
    }
  }, [session, status, redirecting, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}