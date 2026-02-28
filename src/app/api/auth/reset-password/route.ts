import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password } = body

    if (!token || !password) {
      return NextResponse.json({ success: false, message: 'Token and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (!MONGODB_URI) {
      return NextResponse.json({ success: false, message: 'Database not configured' }, { status: 500 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()

    // Find user with valid (non-expired) token
    const user = await db.collection('users').findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    })

    if (!user) {
      await client.close()
      return NextResponse.json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.',
      }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword, updatedAt: new Date() },
        $unset: { resetToken: '', resetTokenExpiry: '' },
      }
    )

    await client.close()

    console.log(`✅ Password reset successful for: ${user.email}`)

    return NextResponse.json({ success: true, message: 'Password has been reset successfully.' })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, message: 'Server error. Please try again.' }, { status: 500 })
  }
}
