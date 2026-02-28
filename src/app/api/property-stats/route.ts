import { NextResponse } from 'next/server'
import { store, ensureInitialized } from './store'

export const dynamic = 'force-dynamic'

// GET - return all property stats (used by dashboard)
export async function GET() {
  ensureInitialized()
  return NextResponse.json({ success: true, stats: store })
}
