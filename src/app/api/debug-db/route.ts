import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function GET(req: NextRequest) {
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: 'MONGODB_URI not configured' })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    // Get all databases
    const databases = await client.db('admin').admin().listDatabases()
    console.log('📚 Databases:', databases.databases.map((d: any) => d.name))

    // Try to find the right database
    let db = client.db('campus-egypt')
    let collections = await db.listCollections().toArray()
    
    if (collections.length === 0) {
      // Try alternative name
      db = client.db('campus-home')
      collections = await db.listCollections().toArray()
    }

    console.log('📋 Collections:', collections.map((c: any) => c.name))

    // Get users collection
    const users = await db.collection('users').find({}).limit(5).toArray()
    console.log('👥 Sample users:', users)

    // Search for test@example.com
    const testUser = await db.collection('users').findOne({ email: 'test@example.com' })
    const testUserLower = await db.collection('users').findOne({ email: { $regex: 'test@example.com', $options: 'i' } })

    await client.close()

    return NextResponse.json({
      success: true,
      databases: databases.databases.map((d: any) => d.name),
      currentDatabase: db.getName(),
      collections: collections.map((c: any) => c.name),
      totalUsers: await db.collection('users').countDocuments(),
      sampleUsers: users.map((u: any) => ({
        email: u.email,
        provider: u.provider,
        hasPassword: !!u.password,
      })),
      testUserExact: testUser ? { email: testUser.email, provider: testUser.provider, hasPassword: !!testUser.password } : null,
      testUserCaseInsensitive: testUserLower ? { email: testUserLower.email, provider: testUserLower.provider, hasPassword: !!testUserLower.password } : null,
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
