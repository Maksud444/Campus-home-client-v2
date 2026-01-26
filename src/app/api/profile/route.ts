import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

function readUsers() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log('❌ users.json file not found, creating...')
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2))
      return []
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('❌ Error reading users:', error)
    return []
  }
}

function writeUsers(users: any[]) {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2))
    console.log('✅ Users written successfully')
  } catch (error) {
    console.error('❌ Error writing users:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('📊 Profile GET - Session:', session?.user?.email)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session' },
        { status: 401 }
      )
    }

    const users = readUsers()
    console.log('📊 Total users in database:', users.length)
    console.log('📊 Looking for user:', session.user.email)
    
    const user = users.find((u: any) => u.email === session.user.email)

    if (!user) {
      console.log('❌ User not found in database')
      console.log('📊 Available users:', users.map((u: any) => u.email))
      
      // Create user if not exists
      const newUser = {
        id: session.user.email.split('@')[0],
        name: session.user.name || 'User',
        email: session.user.email,
        role: (session.user as any).role || 'student',
        image: session.user.image || '',
        phone: '',
        bio: '',
        university: '',
        location: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      users.push(newUser)
      writeUsers(users)
      
      console.log('✅ User created:', newUser.email)
      
      return NextResponse.json({ success: true, user: newUser })
    }

    console.log('✅ User found:', user.email)
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('❌ Profile GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('📊 Profile PUT - Session:', session?.user?.email)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No session' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📊 Update data:', body)
    
    const { name, phone, bio, university, location, image } = body

    const users = readUsers()
    console.log('📊 Total users:', users.length)
    
    let userIndex = users.findIndex((u: any) => u.email === session.user.email)

    if (userIndex === -1) {
      console.log('❌ User not found, creating new user')
      
      // Create user if not exists
      const newUser = {
        id: session.user.email.split('@')[0],
        email: session.user.email,
        role: (session.user as any).role || 'student',
        name,
        phone,
        bio,
        university,
        location,
        image,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      users.push(newUser)
      writeUsers(users)
      
      console.log('✅ User created and updated')
      
      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        user: newUser
      })
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
    
    console.log('✅ User updated:', users[userIndex].email)

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[userIndex]
    })
  } catch (error) {
    console.error('❌ Profile PUT error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'