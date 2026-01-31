import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const MONGODB_URI = process.env.MONGODB_URI || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('📝 Frontend registration for:', email)

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // 1. Register with backend
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        provider: 'credentials',
      }),
    })

    const data = await res.json()
    console.log('📥 Backend response:', data)

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status })
    }

    // 2. Also store password in MongoDB for direct authentication
    if (MONGODB_URI && data.user) {
      try {
        const client = new MongoClient(MONGODB_URI)
        await client.connect()
        let db = client.db('test')
        
        // Verify collections exist
        let collections = await db.listCollections().toArray()
        if (collections.length === 0) {
          db = client.db('campus-egypt')
        }
        
        console.log(`📂 Using database: ${db.databaseName}`)
        
        const updateResult = await db.collection('users').updateOne(
          { email: email.toLowerCase() },
          {
            $set: {
              password: hashedPassword,
              provider: 'credentials'
            }
          }
        )
        
        console.log('📊 MongoDB update result:', {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
        })
        
        await client.close()
        console.log('✅ Password stored in MongoDB')
      } catch (dbError) {
        console.error('❌ MongoDB update error:', dbError)
        // Don't fail registration if MongoDB update fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: data.user,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
