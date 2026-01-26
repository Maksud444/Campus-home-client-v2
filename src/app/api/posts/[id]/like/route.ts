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

// POST - Toggle like
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

    const posts = readPosts()
    const postIndex = posts.findIndex((p: any) => p.id === params.id)

    if (postIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      )
    }

    const userId = (session.user as any).id || session.user.email.split('@')[0]
    const post = posts[postIndex]

    // Initialize likes array if not exists
    if (!post.likes) {
      post.likes = []
    }

    // Check if user already liked
    const likeIndex = post.likes.findIndex((like: any) => like.userId === userId)

    if (likeIndex !== -1) {
      // Unlike
      post.likes.splice(likeIndex, 1)
      console.log('💔 Post unliked:', params.id)
    } else {
      // Like
      post.likes.push({
        userId,
        userName: session.user.name,
        userImage: session.user.image,
        timestamp: new Date().toISOString()
      })
      console.log('❤️ Post liked:', params.id)
    }

    writePosts(posts)

    return NextResponse.json({
      success: true,
      liked: likeIndex === -1,
      likesCount: post.likes.length,
      post: posts[postIndex]
    })
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}