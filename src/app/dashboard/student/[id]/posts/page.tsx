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
  rejectionReason?: string | null
}

export default function MyPostsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const urlUserId = params.id as string

  const [activePosts, setActivePosts] = useState<Post[]>([])
  const [pendingPosts, setPendingPosts] = useState<Post[]>([])
  const [rejectedPosts, setRejectedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showRejected, setShowRejected] = useState(false)

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
      const [backendRes, localRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/properties?userEmail=${userEmail}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }),
        fetch(`/api/posts?userEmail=${encodeURIComponent(userEmail)}`, { cache: 'no-store' }),
        fetch('/api/property-stats', { cache: 'no-store' }).catch(() => null)
      ])

      // Backend active posts
      const backendData = await backendRes.json()
      const statsData = statsRes ? await statsRes.json().catch(() => ({ stats: {} })) : { stats: {} }
      const localStats: Record<string, { views: number; likes: string[] }> = statsData.stats || {}

      if (backendData.success && backendData.properties) {
        const userOwnedProps = backendData.properties.filter((prop: any) =>
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
            location: `${prop.location?.area || ''}, ${prop.location?.city || ''}`,
            images: prop.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
            views: prop.views || s.views || 0,
            likes: bestLikes,
            status: prop.status || 'active',
            createdAt: prop.createdAt
          }
        })
        setActivePosts(posts)
      }

      // Local pending/rejected posts
      const localData = await localRes.json()
      if (localData.success && localData.posts) {
        const pending = localData.posts.filter((p: any) => p.status === 'pending').map(mapLocalPost)
        const rejected = localData.posts.filter((p: any) => p.status === 'rejected').map(mapLocalPost)
        setPendingPosts(pending)
        setRejectedPosts(rejected)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  function mapLocalPost(p: any): Post {
    const imgs = (p.images || []).map((img: any) => typeof img === 'string' ? img : img.url || '')
    const loc = typeof p.location === 'string'
      ? p.location
      : `${p.location?.area || ''}, ${p.location?.city || ''}`
    return {
      id: p.id,
      title: p.title || 'Untitled',
      type: p.type || 'apartment',
      price: p.price || null,
      location: loc,
      images: imgs,
      views: p.views || 0,
      likes: p.likes || [],
      status: p.status,
      createdAt: p.createdAt,
      rejectionReason: p.rejectionReason || null
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setActivePosts(activePosts.filter(post => post.id !== postId))
        setPendingPosts(pendingPosts.filter(post => post.id !== postId))
        setRejectedPosts(rejectedPosts.filter(post => post.id !== postId))
        alert('Post deleted successfully')
      } else {
        alert(data.message || 'Failed to delete post')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    }
  }

  const typeLabel = (type: string) => {
    if (type === 'apartment') return '🏢 Apartment'
    if (type === 'room') return '🛏️ Room'
    if (type === 'roommate') return '👥 Roommate'
    return '🏠 Property'
  }

  const typeBg = (type: string) => {
    if (type === 'apartment') return 'bg-blue-500'
    if (type === 'room') return 'bg-purple-500'
    if (type === 'roommate') return 'bg-green-500'
    return 'bg-blue-500'
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const totalPosts = activePosts.length + pendingPosts.length + rejectedPosts.length

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
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">My Posts</h2>
              {!loading && <p className="text-sm text-gray-500">{totalPosts} total</p>}
            </div>
          </div>
          <Link href="/post" className="btn btn-primary text-sm">
            ➕ Create New
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your posts...</p>
          </div>
        ) : totalPosts === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Create your first post to get started!</p>
            <Link href="/post" className="btn btn-primary">
              Create Post
            </Link>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Pending Approval Section */}
            {pendingPosts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></span>
                  <h3 className="text-lg font-bold text-gray-900">Pending Approval</h3>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                    {pendingPosts.length}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">These posts are waiting for admin review before going live.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onDelete={handleDelete}
                      typeBg={typeBg}
                      typeLabel={typeLabel}
                      statusBadge={
                        <span className="absolute top-3 right-3 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow">
                          ⏳ Pending
                        </span>
                      }
                      showDelete
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active Posts Section */}
            {activePosts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <h3 className="text-lg font-bold text-gray-900">Active Posts</h3>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {activePosts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onDelete={handleDelete}
                      typeBg={typeBg}
                      typeLabel={typeLabel}
                      statusBadge={
                        <span className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow">
                          ✓ Live
                        </span>
                      }
                      showEdit
                      showDelete
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Posts Section (collapsible) */}
            {rejectedPosts.length > 0 && (
              <div>
                <button
                  onClick={() => setShowRejected(!showRejected)}
                  className="flex items-center gap-2 mb-3 text-left w-full"
                >
                  <span className="w-3 h-3 rounded-full bg-red-400"></span>
                  <h3 className="text-lg font-bold text-gray-900">Rejected</h3>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                    {rejectedPosts.length}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 ml-auto transition-transform ${showRejected ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showRejected && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rejectedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onDelete={handleDelete}
                        typeBg={typeBg}
                        typeLabel={typeLabel}
                        statusBadge={
                          <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow">
                            ✗ Rejected
                          </span>
                        }
                        showDelete
                        rejectionReason={post.rejectionReason}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

function PostCard({
  post,
  onDelete,
  typeBg,
  typeLabel,
  statusBadge,
  showEdit,
  showDelete,
  rejectionReason
}: {
  post: Post
  onDelete: (id: string) => void
  typeBg: (type: string) => string
  typeLabel: (type: string) => string
  statusBadge: React.ReactNode
  showEdit?: boolean
  showDelete?: boolean
  rejectionReason?: string | null
}) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <div className="relative h-48 bg-gray-200">
        {post.images && post.images.length > 0 ? (
          <Image src={post.images[0]} alt={post.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🏠</div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${typeBg(post.type)}`}>
            {typeLabel(post.type)}
          </span>
        </div>
        {statusBadge}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{post.title}</h3>
        <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">📍 {post.location}</p>

        {post.price && (
          <p className="text-sm font-bold text-primary mb-2">
            {post.price.toLocaleString()} EGP/mo
          </p>
        )}

        {rejectionReason && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-bold text-red-700 mb-0.5">Rejection reason:</p>
            <p className="text-xs text-red-600">{rejectionReason}</p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>👁️ {post.views || 0}</span>
          <span>❤️ {post.likes?.length || 0}</span>
        </div>

        <div className="flex gap-2">
          {showEdit && (
            <Link
              href={`/properties/${post.id}/edit`}
              className="btn btn-outline text-sm flex-1"
            >
              ✏️ Edit
            </Link>
          )}
          {showDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="btn btn-outline text-sm flex-1 text-red-600 border-red-600 hover:bg-red-50"
            >
              🗑️ Delete
            </button>
          )}
          {rejectionReason && (
            <Link href="/post" className="btn btn-primary text-sm flex-1 text-center">
              🔄 Repost
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
