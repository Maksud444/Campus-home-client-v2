import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { readNotifications, writeNotifications } from '@/lib/posts-store'

// GET — return notifications for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ notifications: [] })
  const all = await readNotifications()
  return NextResponse.json({ notifications: all[session.user.email] || [] })
}

// PATCH — mark notifications as read (body: { ids: string[] | 'all' })
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ success: false })
  const { ids } = await request.json()
  const all = await readNotifications()
  const email = session.user.email
  if (all[email]) {
    if (ids === 'all') {
      all[email] = all[email].map((n: any) => ({ ...n, read: true }))
    } else if (Array.isArray(ids)) {
      all[email] = all[email].map((n: any) => ids.includes(n.id) ? { ...n, read: true } : n)
    }
    await writeNotifications(all)
  }
  return NextResponse.json({ success: true })
}
