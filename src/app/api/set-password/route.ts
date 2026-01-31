import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { MongoClient, ObjectId } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

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

    console.log('🔐 Setting password for:', email)

    if (!MONGODB_URI) {
      return NextResponse.json(
        { success: false, message: 'MongoDB not configured' },
        { status: 500 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)
    console.log('✅ Password hashed')

    // Connect to MongoDB and update user
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    let db = client.db('test')
    
    // Verify database has collections
    let collections = await db.listCollections().toArray()
    if (collections.length === 0) {
      db = client.db('campus-egypt')
    }
    
    console.log(`📂 Using database: ${db.databaseName}`)
    
    const usersCollection = db.collection('users')

    const result = await usersCollection.updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          password: hashedPassword,
          provider: 'credentials',
          updatedAt: new Date(),
        }
      }
    )

    console.log('📊 Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
      updated: result.modifiedCount > 0,
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to set password' },
      { status: 500 }
    )
  }
}
