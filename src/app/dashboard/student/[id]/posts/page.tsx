'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Post {
  id: string
  title: string
  type: string
  price: number | null
  location: string
  images: string[]
  views: number
  likes: any[]
  status: string
  createdAt: string
}

export default function MyPostsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const urlUserId = params.id as string

  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login'); return }
    if (session?.user) {
      const sessionUserId = (session.user as any).id || session.user.email?.split('@')[0]
      if (sessionUserId !== urlUserId) {
        router.replace(`/dashboard/student/${sessionUserId}/posts`)
        return
      }
      fetchMyPosts()
    }
  }, [session, status])

  const fetchMyPosts = async () => {
    const userEmail = session?.user?.email
    if (!userEmail) { setLoading(false); return }
    try {
      setLoading(true)
      const [response, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/properties?userEmail=${userEmail}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }),
        fetch('/api/property-stats', { cache: 'no-store' }).catch(() => null)
      ])
      const data = await response.json()
      const statsData = statsRes ? await statsRes.json().catch(() => ({ stats: {} })) : { stats: {} }
      const localStats: Record<string, { views: number; likes: string[] }> = statsData.stats || {}

      if (data.success && data.properties) {
        const userOwnedProps = data.properties.filter((prop: any) =>
          !prop.userEmail || prop.userEmail.toLowerCase() === userEmail.toLowerCase()
        )
        const posts = userOwnedProps.map((prop: any) => {
          const s = localStats[prop._id] || { views: 0, likes: [] }
          const backendLikes: string[] = (prop.likes || []).filter(Boolean)
          const localLikes: string[] = s.likes || []
          const bestLikes = backendLikes.length >= localLikes.length ? backendLikes : localLikes
          return {
            id: prop._id,
            title: prop.title,
            type: prop.type || 'apartment',
            price: prop.price,
            location: `${prop.location.area}, ${prop.location.city}`,
            images: prop.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
            views: prop.views || s.views || 0,
            likes: bestLikes,
            status: prop.status || 'active',
            createdAt: prop.createdAt
          }
        })
        setMyPosts(posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setMyPosts(myPosts.filter(post => post.id !== postId))
        alert('Post deleted successfully')
      } else {
        alert(data.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <div className="max-w-lg mx-auto px-4 sm:max-w-2xl lg:max-w-4xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/student/${urlUserId}`}
              className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-extrabold text-gray-900">My Active Posts</h2>
          </div>
          <Link href="/post" className="btn btn-primary text-sm">
            ➕ Create New
          </Link>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your posts...</p>
          </div>
        ) : myPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Create your first post to get started!</p>
            <Link href="/post" className="btn btn-primary">
              Create Post
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myPosts.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <Link href={`/properties/${post.id}`} className="block relative h-48 bg-gray-200">
                  {post.images && post.images.length > 0 ? (
                    <Image
                      src={post.images[0]}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🏠
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      post.type === 'apartment' ? 'bg-blue-500' :
                      post.type === 'room' ? 'bg-purple-500' :
                      post.type === 'roommate' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}>
                      {post.type === 'apartment' ? '🏢 Apartment' :
                       post.type === 'room' ? '🛏️ Room' :
                       post.type === 'roommate' ? '👥 Roommate' : '🏢 Apartment'}
                    </span>
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/properties/${post.id}`}>
                    <h3 className="font-bold text-lg mb-2 hover:text-primary line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                    📍 {post.location}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>👁️ {post.views || 0}</span>
                    <span>❤️ {post.likes?.length || 0}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/properties/${post.id}/edit`}
                      className="btn btn-outline text-sm flex-1"
                    >
                      ✏️ Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="btn btn-outline text-sm flex-1 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
