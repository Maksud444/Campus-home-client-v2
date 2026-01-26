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
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      fs.writeFileSync(POSTS_FILE, JSON.stringify([], null, 2))
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

// GET - Get all posts (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')
    const limit = searchParams.get('limit')

    let posts = readPosts()

    // Sort by most recent first
    posts.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Filter by type
    if (type) {
      posts = posts.filter((post: any) => post.type === type)
    }

    // Filter by user
    if (userId) {
      posts = posts.filter((post: any) => post.userId === userId)
    }

    // Limit results
    if (limit) {
      posts = posts.slice(0, parseInt(limit))
    }

    return NextResponse.json({ success: true, posts })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      price,
      location,
      city,
      addressDetails,
      whatsappNumber,
      bedrooms,
      bathrooms,
      area,
      amenities,
      images,
      videos,
      propertyType,
      furnished,
      preferences,
      targetAudience
    } = body

    // Validation
    if (!title || !description || !type || !city || !addressDetails || !whatsappNumber) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!images || images.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Minimum 3 images required' },
        { status: 400 }
      )
    }

    const posts = readPosts()

    const newPost = {
      id: Date.now().toString(),
      userId: (session.user as any).id || session.user.email.split('@')[0],
      userEmail: session.user.email,
      userName: session.user.name || 'User',
      userImage: session.user.image || '',
      userRole: (session.user as any).role || 'student',
      title,
      description,
      type,
      price: price || null,
      location: location || `${city}, ${addressDetails}`,
      city,
      addressDetails,
      whatsappNumber,
      bedrooms: bedrooms || null,
      bathrooms: bathrooms || null,
      area: area || null,
      amenities: amenities || [],
      images: images || [],
      videos: videos || [],
      propertyType: propertyType || 'apartment',
      furnished: furnished || false,
      preferences: preferences || '',
      targetAudience: targetAudience || 'students',
      likes: [],
      views: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    posts.push(newPost)
    writePosts(posts)

    console.log('✅ Post created:', newPost.id)

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post: newPost
    })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create post' },
      { status: 500 }
    )
  }
}