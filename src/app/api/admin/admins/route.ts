import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { readAdmins, writeAdmins } from '@/lib/admins'
import bcrypt from 'bcryptjs'

// GET - List all local admins
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const admins = readAdmins()
    const sanitized = admins.map(a => ({
      id: a.id,
      name: a.name,
      email: a.email,
      createdAt: a.createdAt,
      createdBy: a.createdBy,
      isActive: a.isActive,
    }))

    return NextResponse.json({ success: true, admins: sanitized })
  } catch (error) {
    console.error('GET admins error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// POST - Create a new admin (main admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    // Only main admin (local-admin) can create new admins
    if ((session.user as any).id !== 'local-admin') {
      return NextResponse.json({ success: false, message: 'Only the main admin can create new admins' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const admins = readAdmins()

    // Check if email already exists (also check env var admin email)
    const mainAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
    if (email.toLowerCase() === mainAdminEmail) {
      return NextResponse.json({ success: false, message: 'This email is already in use' }, { status: 409 })
    }
    if (admins.some(a => a.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ success: false, message: 'An admin with this email already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const newAdmin = {
      id: `admin_${Date.now()}`,
      name,
      email,
      passwordHash,
      createdAt: new Date().toISOString(),
      createdBy: 'local-admin',
      isActive: true,
    }

    admins.push(newAdmin)
    writeAdmins(admins)

    console.log(`✅ New admin created: ${email} by main admin`)

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: { id: newAdmin.id, name: newAdmin.name, email: newAdmin.email, createdAt: newAdmin.createdAt },
    })
  } catch (error) {
    console.error('POST admins error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
