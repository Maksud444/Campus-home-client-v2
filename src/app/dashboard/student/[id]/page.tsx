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

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const urlUserId = params.id as string

  const [isVerifying, setIsVerifying] = useState(true)
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const loadDashboardData = async () => {
      if (status === 'loading') return

      if (status === 'unauthenticated') {
        router.replace('/login')
        return
      }

      if (session?.user) {
        const sessionUserId = (session.user as any).id || session.user.email?.split('@')[0]
        const userRole = (session.user as any).role || 'student'

        if (sessionUserId !== urlUserId) {
          router.replace(`/dashboard/${userRole}/${sessionUserId}`)
          return
        }

        if (userRole !== 'student') {
          router.replace(`/dashboard/${userRole}/${sessionUserId}`)
          return
        }

        setIsVerifying(false)
        
        // Check localStorage for immediate update
        const wasUpdated = localStorage.getItem('profile_updated')
        if (wasUpdated === 'true') {
          const updatedName = localStorage.getItem('updated_name')
          if (updatedName) {
            setUserName(updatedName)
          }
          localStorage.removeItem('profile_updated')
          localStorage.removeItem('updated_name')
          localStorage.removeItem('updated_image')
        } else {
          // Load from backend
          await loadFreshUserName(session.user.email)
        }
        
        fetchMyPosts(sessionUserId)
      }
    }

    loadDashboardData()
  }, [session, status, router, urlUserId])

  const loadFreshUserName = async (email?: string) => {
    if (!email) return
    try {
      const response = await fetch(`${API_URL}/api/auth/profile?email=${email}`, {
        cache: 'no-store'
      })
      const data = await response.json()
      if (data.success && data.user) {
        setUserName(data.user.name)
      }
    } catch (error) {
      console.error('Error loading user name:', error)
    }
  }

  const fetchMyPosts = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setMyPosts(data.posts)
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
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

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

  if (status === 'loading' || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const displayName = userName || session.user?.name || 'Student'
  const totalPosts = myPosts.length
  const totalViews = myPosts.reduce((sum, post) => sum + (post.views || 0), 0)
  const totalLikes = myPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Student Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-3xl font-extrabold text-primary">{totalPosts}</div>
            <div className="text-gray-600 font-semibold">My Posts</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">👁️</div>
            <div className="text-3xl font-extrabold text-primary">{totalViews}</div>
            <div className="text-gray-600 font-semibold">Total Views</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">❤️</div>
            <div className="text-3xl font-extrabold text-primary">{totalLikes}</div>
            <div className="text-gray-600 font-semibold">Total Likes</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-extrabold text-primary">
              {totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0}
            </div>
            <div className="text-gray-600 font-semibold">Avg Views/Post</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/post"
            className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">➕</div>
            <div className="text-xl font-bold mb-2">Create New Post</div>
            <div className="text-sm opacity-90">Find a roommate or room</div>
          </Link>

          <Link
            href="/properties"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">🏢</div>
            <div className="text-xl font-bold mb-2">Browse Properties</div>
            <div className="text-sm opacity-90">Find your perfect place</div>
          </Link>

          <Link
            href="/settings"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <div className="text-xl font-bold mb-2">Settings</div>
            <div className="text-sm opacity-90">Manage your account</div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">My Active Posts</h2>
            {totalPosts > 0 && (
              <Link href="/post" className="btn btn-primary">
                ➕ Create New
              </Link>
            )}
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        post.type === 'property' ? 'bg-blue-500 text-white' :
                        post.type === 'roommate' ? 'bg-green-500 text-white' :
                        'bg-purple-500 text-white'
                      }`}>
                        {post.type === 'property' ? '🏢' :
                         post.type === 'roommate' ? '👥' : '🔍'}
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
    </div>
  )
}