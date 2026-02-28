import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    if (!MONGODB_URI) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()

    const users = await db
      .collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    await client.close()

    const sanitized = users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name || 'Unknown',
      email: u.email || '',
      role: u.role || 'student',
      avatar: u.avatar || u.image || '',
      createdAt: u.createdAt || '',
      provider: u.provider || 'credentials',
      isVerified: u.isVerified || false,
    }))

    return NextResponse.json({ success: true, users: sanitized })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
