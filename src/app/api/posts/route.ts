import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { readPosts, writePosts } from '@/lib/posts-store'

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

    let posts = await readPosts()

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

    // Validate media: need at least 3 images OR 1 video
    const images = body.images || []
    const videos = body.videos || []
    if (images.length < 3 && videos.length === 0) {
      return NextResponse.json({ success: false, message: 'Please upload at least 3 images or 1 video' }, { status: 400 })
    }

    const posts = await readPosts()

    const newPost = {
      id: Date.now().toString(),
      ...body,
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
    await writePosts(posts)

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
