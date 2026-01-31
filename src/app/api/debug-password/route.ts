import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password required' },
        { status: 400 }
      )
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    let db = client.db('test')
    let collections = await db.listCollections().toArray()
    if (collections.length === 0) {
      db = client.db('campus-egypt')
    }

    const user = await db.collection('users').findOne({ email })
    await client.close()

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    console.log('🔍 Debug password check for:', email)
    console.log('📝 Provided password:', password)
    console.log('🔐 Stored hash:', user.password)
    console.log('🔐 Hash type:', typeof user.password)

    if (!user.password) {
      return NextResponse.json({
        success: false,
        message: 'User has no password stored',
        user: {
          email: user.email,
          hasPassword: false,
        }
      })
    }

    // Test bcrypt comparison
    const isMatch = await bcrypt.compare(password, user.password)
    console.log('✅ Bcrypt compare result:', isMatch)

    // Also try hashing the provided password to compare hashes
    const testHash = await bcrypt.hash(password, 12)
    console.log('🆕 New hash for comparison:', testHash)

    return NextResponse.json({
      success: true,
      email,
      passwordMatch: isMatch,
      storedHash: user.password,
      user: {
        email: user.email,
        name: user.name,
        hasPassword: !!user.password,
        provider: user.provider,
      }
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
