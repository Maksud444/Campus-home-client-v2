import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

const NOTIF_FILE = path.join(process.cwd(), 'data', 'notifications.json')

function readNotifs(): Record<string, any[]> {
  try {
    if (!fs.existsSync(NOTIF_FILE)) return {}
    return JSON.parse(fs.readFileSync(NOTIF_FILE, 'utf-8'))
  } catch { return {} }
}

function writeNotifs(data: Record<string, any[]>) {
  try {
    const dir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(NOTIF_FILE, JSON.stringify(data, null, 2))
  } catch { /* ignore */ }
}

// GET — return notifications for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ notifications: [] })
  const all = readNotifs()
  return NextResponse.json({ notifications: all[session.user.email] || [] })
}

// PATCH — mark notifications as read (body: { ids: string[] | 'all' })
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ success: false })
  const { ids } = await request.json()
  const all = readNotifs()
  const email = session.user.email
  if (all[email]) {
    if (ids === 'all') {
      all[email] = all[email].map((n: any) => ({ ...n, read: true }))
    } else if (Array.isArray(ids)) {
      all[email] = all[email].map((n: any) => ids.includes(n.id) ? { ...n, read: true } : n)
    }
    writeNotifs(all)
  }
  return NextResponse.json({ success: true })
}
