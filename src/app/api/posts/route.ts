import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json')

function readPosts() {
  try {
    if (!fs.existsSync(POSTS_FILE)) {
      const dataDir = path.join(process.cwd(), 'data')
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
      fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2))
      return []
    }
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

// GET - Get all posts (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    const userEmail = searchParams.get('userEmail')
    const limit = searchParams.get('limit')
    const isAdmin = searchParams.get('admin') === 'true'
    const statusFilter = searchParams.get('status')

    let posts = readPosts()

    posts.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // If userEmail provided (for user's own dashboard), verify session and return all their posts
    if (userEmail && !isAdmin) {
      const session = await getServerSession(authOptions)
      if (session?.user?.email?.toLowerCase() === userEmail.toLowerCase()) {
        posts = posts.filter((post: any) => post.userEmail?.toLowerCase() === userEmail.toLowerCase())
        if (statusFilter) posts = posts.filter((post: any) => post.status === statusFilter)
        if (limit) posts = posts.slice(0, parseInt(limit))
        return NextResponse.json({ success: true, posts })
      }
      // Session email doesn't match — return nothing
      return NextResponse.json({ success: true, posts: [] })
    }

    if (!isAdmin) {
      posts = posts.filter((post: any) => post.status === 'approved')
    } else if (statusFilter) {
      posts = posts.filter((post: any) => post.status === statusFilter)
    }

    if (type) posts = posts.filter((post: any) => post.type === type)
    if (userId) posts = posts.filter((post: any) => post.userId === userId)
    if (limit) posts = posts.slice(0, parseInt(limit))

    return NextResponse.json({ success: true, posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch posts' }, { status: 500 })
  }
}

// POST - Submit new post for admin approval
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate images (accept both string[] and {url}[] formats)
    const images = body.images || []
    if (images.length < 3) {
      return NextResponse.json({ success: false, message: 'Minimum 3 images required' }, { status: 400 })
    }

    const posts = readPosts()

    const newPost = {
      id: Date.now().toString(),
      // Store raw body exactly as it would be sent to external backend
      ...body,
      // Override / ensure these fields
      userEmail: session.user.email,
      userName: session.user.name || body.userName || 'User',
      userImage: session.user.image || body.userImage || '',
      status: 'pending',
      rejectionReason: null,
      approved_by: null,
      approved_by_name: null,
      approved_at: null,
      likes: [],
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    posts.push(newPost)
    writePosts(posts)

    console.log('✅ Post queued for approval:', newPost.id)

    return NextResponse.json({
      success: true,
      message: 'Post submitted for admin approval',
      post: newPost
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ success: false, message: 'Failed to create post' }, { status: 500 })
  }
}
