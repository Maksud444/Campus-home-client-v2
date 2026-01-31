import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('🔧 Converting OAuth user to credentials:', email)

    // Call backend to update user
    const res = await fetch(`${API_URL}/api/auth/convert-to-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await res.json()
    console.log('📥 Backend response:', data)

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json({
      success: true,
      message: 'User converted to credentials login',
    })
  } catch (error: any) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Conversion failed' },
      { status: 500 }
    )
  }
}
