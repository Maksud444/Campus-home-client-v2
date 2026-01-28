'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

// Separate component that uses useSearchParams
function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      console.error('Auth error:', error)
      router.push('/login?error=' + error)
      return
    }

    if (token) {
      // Save token
      api.setToken(token)
      
      // Get user profile
      api.getProfile()
        .then(response => {
          if (response.user) {
            api.setUser(response.user)
            
            // Redirect based on role
            const role = response.user.role
            switch (role) {
              case 'student':
                router.push('/dashboard/student')
                break
              case 'agent':
                router.push('/dashboard/agent')
                break
              case 'owner':
                router.push('/dashboard/owner')
                break
              case 'service-provider':
                router.push('/dashboard/service-provider')
                break
              default:
                router.push('/dashboard')
            }
          } else {
            router.push('/login?error=profile_failed')
          }
        })
        .catch(err => {
          console.error('Profile fetch failed:', err)
          router.push('/login?error=profile_failed')
        })
    } else {
      router.push('/login')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
        <h2 className="mt-6 text-xl font-semibold text-gray-900">
          Completing authentication...
        </h2>
        <p className="mt-2 text-gray-600">Please wait a moment</p>
      </div>
    </div>
  )
}

// Main component wrapped in Suspense
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}