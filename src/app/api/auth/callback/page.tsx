'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'

export default function AuthCallback() {
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}