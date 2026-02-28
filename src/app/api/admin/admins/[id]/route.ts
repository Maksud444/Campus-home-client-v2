import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { readAdmins, writeAdmins } from '@/lib/admins'
import bcrypt from 'bcryptjs'

// DELETE - Remove an admin (main admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    if ((session.user as any).id !== 'local-admin') {
      return NextResponse.json({ success: false, message: 'Only the main admin can delete admins' }, { status: 403 })
    }

    const admins = readAdmins()
    const index = admins.findIndex(a => a.id === params.id)

    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 })
    }

    const removed = admins.splice(index, 1)[0]
    writeAdmins(admins)

    console.log(`🗑️ Admin removed: ${removed.email}`)

    return NextResponse.json({ success: true, message: 'Admin removed successfully' })
  } catch (error) {
    console.error('DELETE admin error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

// PUT - Reset password
// Main admin: can reset any admin's password
// Other admins: can only reset their own password
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 })
    }

    const currentId = (session.user as any).id
    const isMainAdmin = currentId === 'local-admin'

    // Non-main admins can only reset their own password
    if (!isMainAdmin && params.id !== currentId) {
      return NextResponse.json({ success: false, message: 'You can only reset your own password' }, { status: 403 })
    }

    const body = await request.json()
    const { newPassword } = body

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Main admin resetting own password → update env var note (can't update env)
    if (params.id === 'local-admin') {
      return NextResponse.json({
        success: false,
        message: 'Main admin password is set via environment variables (ADMIN_PASSWORD). Please update it in Coolify.',
      }, { status: 400 })
    }

    const admins = readAdmins()
    const index = admins.findIndex(a => a.id === params.id)

    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 })
    }

    admins[index].passwordHash = await bcrypt.hash(newPassword, 12)
    writeAdmins(admins)

    console.log(`🔑 Password reset for admin: ${admins[index].email}`)

    return NextResponse.json({ success: true, message: 'Password reset successfully' })
  } catch (error) {
    console.error('PUT admin password error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
