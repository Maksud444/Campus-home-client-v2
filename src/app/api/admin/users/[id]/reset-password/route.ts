import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { MongoClient, ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    if (!MONGODB_URI) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()

    let filter: any
    try {
      filter = { _id: new ObjectId(params.id) }
    } catch {
      filter = { _id: params.id }
    }

    const result = await db.collection('users').updateOne(
      filter,
      { $set: { password: passwordHash, updatedAt: new Date().toISOString() } }
    )

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    console.log(`🔑 Password reset for user ${params.id} by admin ${session.user.email}`)

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('User password reset error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
