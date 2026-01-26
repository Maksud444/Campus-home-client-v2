import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import fs from 'fs'
import path from 'path'

const POSTS_FILE = path.join(process.cwd(), 'data', 'posts.json')

function readPosts() {
  try {
    if (!fs.existsSync(POSTS_FILE)) {
      return []
    }
    const data = fs.readFileSync(POSTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading posts:', error)
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

// GET - Get single post and increment view
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    posts[postIndex].views = (posts[postIndex].views || 0) + 1
    writePosts(posts)

    return NextResponse.json({ success: true, post: posts[postIndex] })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

// PUT - Update post
export async function PUT(
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

    const body = await request.json()
    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user owns the post
    if (posts[postIndex].userEmail !== session.user.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Not your post' },
        { status: 403 }
      )
    }

    // Update post
    posts[postIndex] = {
      ...posts[postIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }

    writePosts(posts)

    console.log('✅ Post updated:', params.id)

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      post: posts[postIndex]
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update post' },
      { status: 500 }
    )
  }
}

// DELETE - Delete post
export async function DELETE(
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

    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    // Check if user owns the post
    if (posts[postIndex].userEmail !== session.user.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Not your post' },
        { status: 403 }
      )
    }

    // Delete post
    posts.splice(postIndex, 1)
    writePosts(posts)

    console.log('✅ Post deleted:', params.id)

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete post' },
      { status: 500 }
    )
  }
}