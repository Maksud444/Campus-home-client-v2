import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

// Mark as dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('📖 Getting profile for:', email)

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
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        phone: user.phone,
        university: user.university,
        bio: user.bio,
        location: user.location,
        avatar: user.avatar,
      }
    })
  } catch (error: any) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, university, bio, location, avatar } = body

    if (!email) {
      console.error('❌ Email is required')
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('💾 Updating profile for:', email)
    console.log('📝 Update data:', { name, phone, university, bio, location, avatar })

    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not configured')
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      )
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log('✅ Connected to MongoDB')

    let db = client.db('test')
    let collections = await db.listCollections().toArray()
    if (collections.length === 0) {
      db = client.db('campus-egypt')
    }

    console.log(`📂 Using database: ${db.databaseName}`)

    const updateData: any = {}
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (university) updateData.university = university
    if (bio) updateData.bio = bio
    if (location) updateData.location = location
    if (avatar) updateData.avatar = avatar
    updateData.updatedAt = new Date()

    console.log('🔄 Executing update with:', updateData)

    const result = await db.collection('users').updateOne(
      { email },
      { $set: updateData }
    )

    console.log('📊 Update result:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })

    await client.close()

    if (result.matchedCount === 0) {
      console.error('❌ User not found:', email)
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    console.log('✅ Profile updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        email,
        name: updateData.name || name,
        phone: updateData.phone,
        university: updateData.university,
        bio: updateData.bio,
        location: updateData.location,
        avatar: updateData.avatar,
      }
    })
  } catch (error: any) {
    console.error('❌ Profile PUT error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}