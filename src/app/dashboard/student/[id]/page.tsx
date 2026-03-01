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
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  // Refresh stats when user returns to this tab (e.g. after viewing a property)
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && session?.user) {
        setStatsRefreshKey(k => k + 1)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [session])

  // Re-run fetchMyPosts when statsRefreshKey changes (triggered by tab returning to focus)
  useEffect(() => {
    if (statsRefreshKey === 0 || !session?.user) return
    const userId = (session.user as any).id || session.user.email?.split('@')[0]
    if (userId) fetchMyPosts(userId)
  }, [statsRefreshKey])

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
      const userEmail = session?.user?.email
      if (!userEmail) {
        setLoading(false)
        return
      }

      // Fetch properties and local stats in parallel
      // Backend is primary source; local stats (globalThis) are fallback for likes
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
        // Client-side filter: only show this user's own posts.
        // Posts without userEmail (older data) pass through since the backend
        // already filtered by userEmail query param.
        const userOwnedProps = data.properties.filter((prop: any) =>
          !prop.userEmail || prop.userEmail.toLowerCase() === userEmail.toLowerCase()
        )
        const posts = userOwnedProps.map((prop: any) => {
          const s = localStats[prop._id] || { views: 0, likes: [] }
          // Prefer backend for views (PUT persists there), prefer whichever is larger for likes
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
    <div className="min-h-screen bg-gray-50 pt-14 pb-10">
      <div className="max-w-lg mx-auto px-4 sm:max-w-2xl lg:max-w-4xl">

        {/* Hero Card */}
        <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 mb-6 text-white overflow-hidden shadow-xl">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">
              Welcome back, {displayName}! 👋
            </h1>
            <p className="text-white/80 text-sm sm:text-base">Student Dashboard</p>
          </div>
          <div className="absolute -right-6 -bottom-6 text-[130px] opacity-10 select-none pointer-events-none">🏠</div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Link
            href="/post"
            className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-md p-4 hover:scale-105 transition-transform flex flex-col items-center text-center gap-1"
          >
            <div className="text-2xl">➕</div>
            <div className="text-xs font-bold leading-tight">Create New Post</div>
            <div className="text-xs opacity-80 hidden sm:block">Find a roommate or room</div>
          </Link>

          <Link
            href="/properties"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-md p-4 hover:scale-105 transition-transform flex flex-col items-center text-center gap-1"
          >
            <div className="text-2xl">🏢</div>
            <div className="text-xs font-bold leading-tight">Browse Properties</div>
            <div className="text-xs opacity-80 hidden sm:block">Find your perfect place</div>
          </Link>

          <Link
            href="/settings"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-md p-4 hover:scale-105 transition-transform flex flex-col items-center text-center gap-1"
          >
            <div className="text-2xl">⚙️</div>
            <div className="text-xs font-bold leading-tight">Settings</div>
            <div className="text-xs opacity-80 hidden sm:block">Manage your account</div>
          </Link>
        </div>

        {/* My Posts Navigation Card → /posts page */}
        <Link
          href={`/dashboard/student/${urlUserId}/posts`}
          className="bg-white rounded-2xl shadow-md p-4 mb-6 flex items-center justify-between hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📝</div>
            <div>
              <div className="text-xs text-gray-400">Manage your listings</div>
              <div className="font-extrabold text-gray-900 text-base">My Posts</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <span className="text-3xl font-extrabold text-primary">{totalPosts}</span>
            )}
            <svg className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Refresh hint */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-gray-400">Stats update each time someone views or likes your posts.</p>
          <button
            onClick={() => setStatsRefreshKey(k => k + 1)}
            className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Stats Row — 3 compact cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">👁️</div>
            <div className="text-2xl font-extrabold text-primary">{totalViews}</div>
            <div className="text-xs text-gray-500 font-semibold">Total Views</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-2xl font-extrabold text-primary">{totalLikes}</div>
            <div className="text-gray-500 text-xs font-semibold">Total Likes</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-4 text-center">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-2xl font-extrabold text-primary">
              {totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0}
            </div>
            <div className="text-gray-500 text-xs font-semibold">Avg Views/Post</div>
          </div>
        </div>

      </div>
    </div>
  )
}