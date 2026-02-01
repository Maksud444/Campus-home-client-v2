import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'
    
    // Fetch fresh data from backend
    const response = await fetch(`${API_URL}/api/auth/profile?email=${email}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
    
    const data = await response.json()
    
    if (data.success && data.user) {
      return NextResponse.json({ 
        success: true, 
        user: data.user 
      })
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to refresh session' 
    }, { status: 500 })
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server error' 
    }, { status: 500 })
  }
}