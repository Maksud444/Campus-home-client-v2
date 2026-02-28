import { NextRequest, NextResponse } from 'next/server'
import { store, ensureInitialized, persist } from '../store'

export const dynamic = 'force-dynamic'

// GET - return stats for a single property
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  ensureInitialized()
  const s = store[params.id] || { views: 0, likes: [] }
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
    ensureInitialized()
    const body = await request.json()

    if (!store[params.id]) {
      store[params.id] = { views: 0, likes: [] }
    }

    const s = store[params.id]

    if (body.action === 'view') {
      s.views += 1
      persist()
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
      persist()
      return NextResponse.json({ success: true, liked: isLiked, likesCount: s.likes.length })
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 })
  } catch (e) {
    console.error('property-stats error:', e)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
