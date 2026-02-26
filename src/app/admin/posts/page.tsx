'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Post {
  id: string
  _id?: string
  title: string
  type: string
  price: number | null
  location: string | { city?: string; area?: string }
  images: string[]
  views: number
  likes: any[]
  status: string
  createdAt: string
  userId?: { name: string; email: string } | string
}

export default function AdminPostsPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const token = (session?.user as any)?.backendToken

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY) headers['X-Admin-Key'] = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY
      const res = await fetch(`${API_URL}/api/admin/posts`, { headers })
      const data = await res.json()
      if (data.success && data.data?.posts) setPosts(data.data.posts)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const filtered = posts.filter(p => {
    const matchType = typeFilter === 'all' || p.type?.toLowerCase() === typeFilter
    const loc = typeof p.location === 'string' ? p.location : `${p.location?.area || ''} ${p.location?.city || ''}`.trim()
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      loc.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return
    setActionLoading(postId + '_delete')
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success || res.ok) {
        setPosts(prev => prev.filter(p => (p.id || p._id) !== postId))
        showToast('Post deleted successfully', 'success')
      } else {
        showToast(data.message || 'Failed to delete post', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const getLocation = (loc: Post['location']) => {
    if (!loc) return 'N/A'
    if (typeof loc === 'string') return loc
    return [loc.area, loc.city].filter(Boolean).join(', ') || 'N/A'
  }

  const getAuthor = (userId: Post['userId']) => {
    if (!userId) return 'Unknown'
    if (typeof userId === 'string') return userId.slice(-8)
    return userId.name || userId.email || 'Unknown'
  }

  const typeCounts = posts.reduce((acc, p) => {
    const t = p.type?.toLowerCase() || 'other'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const uniqueTypes = [...new Set(posts.map(p => p.type?.toLowerCase()).filter(Boolean))]

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      available: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      rented: 'bg-slate-100 text-slate-600',
      sold: 'bg-slate-100 text-slate-600',
    }
    return map[status?.toLowerCase()] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white font-semibold text-sm ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Posts Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review and manage all user posts</p>
        </div>
        <button onClick={fetchPosts} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Posts</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{posts.length}</p>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Views</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {posts.reduce((s, p) => s + (p.views || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Likes</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {posts.reduce((s, p) => s + (p.likes?.length || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All ({posts.length})
          </button>
          {uniqueTypes.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${typeFilter === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t} ({typeCounts[t] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-slate-500 font-medium">No posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Post</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Author</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Location</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Views</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(post => {
                  const postId = post.id || post._id || ''
                  const imgUrl = post.images?.[0]
                  return (
                    <tr key={postId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 text-sm line-clamp-1 max-w-[160px]">{post.title}</p>
                            <p className="text-[11px] text-slate-400">{postId.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{getAuthor(post.userId)}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg capitalize">{post.type || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{getLocation(post.location)}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900">{post.price ? `${post.price.toLocaleString()} EGP` : 'N/A'}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{(post.views || 0).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${getStatusBadge(post.status)}`}>
                          {post.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(postId)}
                            disabled={actionLoading === postId + '_delete'}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all disabled:opacity-50"
                            title="Delete post"
                          >
                            {actionLoading === postId + '_delete' ? (
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
            Showing {filtered.length} of {posts.length} posts
          </div>
        )}
      </div>
    </div>
  )
}
