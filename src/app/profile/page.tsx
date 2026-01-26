import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

function readUsers() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

function writeUsers(users: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const users = readUsers()
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

    const users = readUsers()
    const userIndex = users.findIndex((u: any) => u.email === session.user.email)

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Update user
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

    writeUsers(users)

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