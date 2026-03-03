'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Property {
  _id: string
  title: string
  description: string
  price: number | null
  location: { city: string; area: string; address?: string }
  propertyType: string
  type: string
  bedrooms?: number
  images: Array<{ url: string } | string>
  status: string
  createdAt: string
  userId?: { name: string; email: string } | string
}

interface LocalPost {
  id: string
  title: string
  type: string
  price: number | null
  location: string | { city?: string; area?: string; address?: string }
  images: any[]
  status: string
  createdAt: string
  userEmail: string
  userName: string
  rejectionReason?: string | null
}

type StatusFilter = 'all' | 'active' | 'pending' | 'rejected'

export default function AdminPostsPage() {
  const { data: session } = useSession()

  // ── External backend properties ──
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ── Local pending posts ──
  const [pendingPosts, setPendingPosts] = useState<LocalPost[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [approveLoading, setApproveLoading] = useState<string | null>(null)

  // ── Rejection modal (for local pending posts) ──
  const [rejectModal, setRejectModal] = useState<{ postId: string; postTitle: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const token = (session?.user as any)?.backendToken

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const adminHeaders = () => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ? { 'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY } : {}),
  })

  // Fetch all properties from external backend
  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/properties?limit=500`, { headers: adminHeaders() })
      const data = await res.json()
      if (data.success) {
        setProperties(data.data?.properties || data.properties || [])
      } else {
        // Fallback to public endpoint
        const res2 = await fetch(`${API_URL}/api/properties?limit=500`, { cache: 'no-store' })
        const data2 = await res2.json()
        if (data2.success) setProperties(data2.properties || [])
      }
    } catch (err) {
      console.error('Error fetching properties:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  // Fetch local pending posts
  const fetchPendingPosts = useCallback(async () => {
    setPendingLoading(true)
    try {
      const res = await fetch('/api/posts?admin=true&status=pending', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) setPendingPosts(data.posts || [])
    } catch (err) {
      console.error('Error fetching pending posts:', err)
    } finally {
      setPendingLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
    fetchPendingPosts()
  }, [fetchProperties, fetchPendingPosts])

  // ── Local pending post actions ──
  const handleApproveLocal = async (postId: string) => {
    setApproveLoading(postId + '_approve')
    try {
      const res = await fetch(`/api/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      const data = await res.json()
      if (data.success) {
        setPendingPosts(prev => prev.filter(p => p.id !== postId))
        showToast('✅ Post approved and published. Approval email sent.', 'success')
        setTimeout(fetchProperties, 2000)
      } else {
        showToast(data.message || 'Approval failed', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setApproveLoading(null)
    }
  }

  const openRejectModal = (postId: string, postTitle: string) => {
    setRejectReason('')
    setRejectModal({ postId, postTitle })
  }

  const handleRejectLocal = async () => {
    if (!rejectModal || !rejectReason.trim()) return
    const { postId } = rejectModal
    setApproveLoading(postId + '_reject')
    setRejectModal(null)
    try {
      const res = await fetch(`/api/posts/${postId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reason: rejectReason.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setPendingPosts(prev => prev.filter(p => p.id !== postId))
        showToast('🗑️ Post rejected. Rejection email sent to user.', 'success')
      } else {
        showToast(data.message || 'Rejection failed', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setApproveLoading(null)
      setRejectReason('')
    }
  }

  // ── External backend property actions ──
  const handleApproveProperty = async (id: string) => {
    setActionLoading(id + '_approve')
    try {
      const res = await fetch(`${API_URL}/api/admin/properties/${id}/approve`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        setProperties(prev => prev.map(p => p._id === id ? { ...p, status: 'active' } : p))
        showToast('Property approved successfully', 'success')
      } else {
        showToast(data.message || 'Failed to approve', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectProperty = async (id: string) => {
    setActionLoading(id + '_reject')
    try {
      const res = await fetch(`${API_URL}/api/admin/properties/${id}/reject`, {
        method: 'PUT',
        headers: adminHeaders(),
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        setProperties(prev => prev.map(p => p._id === id ? { ...p, status: 'rejected' } : p))
        showToast('Property rejected', 'success')
      } else {
        showToast(data.message || 'Failed to reject', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return
    setActionLoading(id + '_delete')
    try {
      const res = await fetch(`${API_URL}/api/admin/properties/${id}`, {
        method: 'DELETE',
        headers: adminHeaders(),
      })
      const data = await res.json()
      if (data.success || res.ok) {
        setProperties(prev => prev.filter(p => p._id !== id))
        showToast('Post deleted successfully', 'success')
      } else {
        showToast(data.message || 'Failed to delete', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const getImgUrl = (images: any[]): string => {
    if (!images?.length) return ''
    const first = images[0]
    return typeof first === 'string' ? first : first?.url || ''
  }

  const getLocation = (loc: any): string => {
    if (!loc) return 'N/A'
    if (typeof loc === 'string') return loc
    return [loc.area, loc.city].filter(Boolean).join(', ') || 'N/A'
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      approved: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
      rented: 'bg-slate-100 text-slate-600',
    }
    return map[status?.toLowerCase()] || 'bg-slate-100 text-slate-600'
  }

  const filtered = properties.filter(p => {
    const matchStatus = statusFilter === 'all' || (p.status || 'active').toLowerCase() === statusFilter
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.area?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const tabCounts = {
    all: properties.length,
    active: properties.filter(p => ['active', 'approved'].includes((p.status || 'active').toLowerCase())).length,
    pending: properties.filter(p => (p.status || '').toLowerCase() === 'pending').length,
    rejected: properties.filter(p => (p.status || '').toLowerCase() === 'rejected').length,
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

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Reject Post</h3>
                <p className="text-xs text-slate-500 truncate max-w-[260px]">{rejectModal.postTitle}</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-3">The user will receive an email with this reason.</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Images are unclear, please upload higher quality photos."
              rows={4}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400 resize-none"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectLocal}
                disabled={!rejectReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-bold transition-all"
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Posts Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage all posts — approve, reject, or delete</p>
        </div>
        <button
          onClick={() => { fetchProperties(); fetchPendingPosts() }}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ══ Pending Posts — Approval Section ══ */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Pending Approval</h2>
              <p className="text-xs text-slate-500">New posts awaiting review — user gets email on decision</p>
            </div>
          </div>
          {!pendingLoading && (
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${pendingPosts.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {pendingPosts.length} pending
            </span>
          )}
        </div>

        {pendingLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : pendingPosts.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-slate-500 font-medium text-sm">No pending posts — all clear!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingPosts.map(post => (
              <div key={post.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                {getImgUrl(post.images) ? (
                  <img src={getImgUrl(post.images)} alt="" className="w-16 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-2xl">🏠</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{post.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    by <span className="font-semibold">{post.userName || post.userEmail}</span>
                    {' · '}{getLocation(post.location)}
                    {post.price ? ` · ${Number(post.price).toLocaleString()} EGP` : ''}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="hidden sm:inline text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg capitalize flex-shrink-0">
                  {post.type}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApproveLocal(post.id)}
                    disabled={!!approveLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
                  >
                    {approveLoading === post.id + '_approve' ? (
                      <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(post.id, post.title)}
                    disabled={!!approveLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-xs font-bold rounded-lg border border-red-200 transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ All Published Posts ══ */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-4 flex flex-col md:flex-row gap-3">
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
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          {(['all', 'active', 'pending', 'rejected'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${
                statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s} ({tabCounts[s]})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="text-slate-500 font-medium">No posts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Post</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Location</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Price</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Date</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(prop => {
                  const imgUrl = getImgUrl(prop.images as any[])
                  const status = (prop.status || 'active').toLowerCase()
                  return (
                    <tr key={prop._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img src={imgUrl} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 text-sm line-clamp-1 max-w-[150px]">{prop.title}</p>
                            <p className="text-[11px] text-slate-400">{prop._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{[prop.location?.area, prop.location?.city].filter(Boolean).join(', ') || 'N/A'}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900">{prop.price ? `${prop.price.toLocaleString()} EGP` : 'N/A'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg capitalize">{prop.propertyType || prop.type || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${getStatusBadge(prop.status)}`}>
                          {prop.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {prop.createdAt ? new Date(prop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/properties/${prop._id}`}
                            target="_blank"
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
                            title="View"
                          >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          {status !== 'active' && status !== 'approved' && (
                            <button
                              onClick={() => handleApproveProperty(prop._id)}
                              disabled={actionLoading === prop._id + '_approve'}
                              className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-all disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === prop._id + '_approve' ? (
                                <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          )}
                          {status !== 'rejected' && (
                            <button
                              onClick={() => handleRejectProperty(prop._id)}
                              disabled={actionLoading === prop._id + '_reject'}
                              className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              {actionLoading === prop._id + '_reject' ? (
                                <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteProperty(prop._id)}
                            disabled={actionLoading === prop._id + '_delete'}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {actionLoading === prop._id + '_delete' ? (
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
            Showing {filtered.length} of {properties.length} posts
          </div>
        )}
      </div>
    </div>
  )
}
