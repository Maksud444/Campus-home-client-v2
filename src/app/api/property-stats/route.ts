import { NextResponse } from 'next/server'
import { getStore } from './store'

export const dynamic = 'force-dynamic'

// GET - return all property stats (used by dashboard)
export async function GET() {
  const stats = getStore()
  return NextResponse.json({ success: true, stats })
}
