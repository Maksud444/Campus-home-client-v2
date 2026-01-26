import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json')

function readUsers() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
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
    console.error('Error reading users:', error)
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
  } catch (error) {
    console.error('Error writing users:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    console.log('📝 Registration request:', { name, email, role })

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const users = readUsers()
    
    // Check if user already exists
    const existingUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('🔐 Password hashed successfully')

    // Create new user
    const newUser = {
      id: email.split('@')[0],
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      image: '',
      phone: '',
      bio: '',
      university: '',
      location: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    users.push(newUser)
    writeUsers(users)

    console.log('✅ User registered successfully:', newUser.email)

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    )
  }
}