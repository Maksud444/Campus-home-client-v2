import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const STATS_FILE = path.join(process.cwd(), 'data', 'property-stats.json')

function readStats(): Record<string, { views: number; likes: string[] }> {
  try {
    if (!fs.existsSync(STATS_FILE)) return {}
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf-8'))
  } catch {
    return {}
  }
}

// GET - return all property stats (used by dashboard)
export async function GET() {
  const stats = readStats()
  return NextResponse.json({ success: true, stats })
}
