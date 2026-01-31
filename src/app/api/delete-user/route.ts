import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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

    const result = await db.collection('users').deleteOne({ email })
    await client.close()

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} deleted successfully`,
      deletedCount: result.deletedCount,
    })
  } catch (error: any) {
    console.error('❌ Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
