import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json')

function readPosts() {
  try {
    if (!fs.existsSync(POSTS_FILE)) return []
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writePosts(posts: any[]) {
  try {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2))
  } catch (error) {
    console.error('Error writing posts:', error)
  }
}

// POST - Approve or reject a post (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const role = (session.user as any).role
    if (role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action } = body // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      )
    }

    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    // Double approval check
    if (posts[postIndex].status === 'approved' && action === 'approve') {
      return NextResponse.json(
        { success: false, message: 'Post is already approved' },
        { status: 409 }
      )
    }

    const adminId = (session.user as any).id || session.user.email
    const adminName = session.user.name || session.user.email || 'Admin'
    const now = new Date().toISOString()

    if (action === 'approve') {
      posts[postIndex].status = 'approved'
      posts[postIndex].approved_by = adminId
      posts[postIndex].approved_by_name = adminName
      posts[postIndex].approved_at = now
    } else {
      posts[postIndex].status = 'rejected'
      posts[postIndex].approved_by = null
      posts[postIndex].approved_by_name = null
      posts[postIndex].approved_at = null
    }

    posts[postIndex].updatedAt = now
    writePosts(posts)

    console.log(`✅ Post ${params.id} ${action}d by ${adminName}`)

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Post approved successfully' : 'Post rejected',
      post: posts[postIndex]
    })
  } catch (error) {
    console.error('Approve/reject error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
