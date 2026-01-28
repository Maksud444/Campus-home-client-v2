import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

/**
 * IMPORTANT:
 * fs ব্যবহার করলে Node.js runtime দরকার
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

async function readUsers() {
  try {
    const data = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeUsers(users: any[]) {
  await writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = await readUsers()
    const user = users.find((u: any) => u.email === session.user.email)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, phone, bio, university, location, image } = body

    const users = await readUsers()
    const userIndex = users.findIndex(
      (u: any) => u.email === session.user.email
    )

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    users[userIndex] = {
      ...users[userIndex],
      name,
      phone,
      bio,
      university,
      location,
      image,
      updatedAt: new Date().toISOString()
    }

    await writeUsers(users)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[userIndex]
    })
  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
