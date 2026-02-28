import { NextRequest, NextResponse } from 'next/server'
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

function writeStats(stats: Record<string, { views: number; likes: string[] }>) {
  try {
    const dir = path.dirname(STATS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2))
  } catch (e) {
    console.error('Error writing property stats:', e)
  }
}

// GET - return stats for a single property
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const stats = readStats()
  const s = stats[params.id] || { views: 0, likes: [] }
  return NextResponse.json({
    success: true,
    views: s.views,
    likes: s.likes,
    likesCount: s.likes.length,
  })
}

// POST - action: 'view' increments view count
//        action: 'like' toggles like for a user email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const stats = readStats()

    if (!stats[params.id]) {
      stats[params.id] = { views: 0, likes: [] }
    }

    const s = stats[params.id]

    if (body.action === 'view') {
      s.views += 1
      writeStats(stats)
      return NextResponse.json({ success: true, views: s.views })
    }

    if (body.action === 'like') {
      const userEmail = body.userEmail as string
      if (!userEmail) {
        return NextResponse.json({ success: false, message: 'userEmail required' }, { status: 400 })
      }
      const idx = s.likes.indexOf(userEmail)
      const isLiked = idx === -1
      if (isLiked) {
        s.likes.push(userEmail)
      } else {
        s.likes.splice(idx, 1)
      }
      writeStats(stats)
      return NextResponse.json({ success: true, liked: isLiked, likesCount: s.likes.length })
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('property-stats error:', e)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
