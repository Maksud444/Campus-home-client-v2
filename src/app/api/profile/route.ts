import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// Mark as dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Call backend API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: session.user.email })
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user: data.user })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Call backend API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.user.email,
        ...body
      })
    })

    const data = await response.json()

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: data.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: data.user
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}