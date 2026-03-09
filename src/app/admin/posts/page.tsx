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
  videos?: string[]
  status: string
  createdAt: string
  userEmail: string
  userName: string
  userImage?: string
  description?: string
  propertyType?: string
  furnished?: boolean
  amenities?: string[]
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  whatsapp?: { countryCode: string; number: string }
  preferences?: string[]
  targetAudience?: string
  rejectionReason?: string | null
}

type StatusFilter = 'all' | 'active' | 'pending' | 'rejected'

export default function AdminPostsPage() {
  const { data: session } = useSession()

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // All local posts (pending + approved + rejected from posts.json)
  const [localPosts, setLocalPosts] = useState<LocalPost[]>([])

  const [pendingPosts, setPendingPosts] = useState<LocalPost[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [approveLoading, setApproveLoading] = useState<string | null>(null)

  const [rejectModal, setRejectModal] = useState<{ postId: string; postTitle: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Full post view modal
  const [viewPost, setViewPost] = useState<LocalPost | null>(null)
  const [viewImageIdx, setViewImageIdx] = useState(0)

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

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/properties?limit=500`, { headers: adminHeaders() })
      const data = await res.json()
      if (data.success) {
        setProperties(data.data?.properties || data.properties || [])
      } else {
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

  const fetchPendingPosts = useCallback(async () => {
    setPendingLoading(true)
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch('/api/posts?admin=true&status=pending', { cache: 'no-store' }),
        fetch('/api/posts?admin=true', { cache: 'no-store' }),
      ])
      const pendingData = await pendingRes.json()
      const allData = await allRes.json()
      if (pendingData.success) setPendingPosts(pendingData.posts || [])
      if (allData.success) setLocalPosts(allData.posts || [])
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

  // ── Approve ──
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
        setLocalPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'approved' } : p))
        if (viewPost?.id === postId) setViewPost(null)
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
        setLocalPosts(prev => prev.map(p => p.id === postId ? { ...p, status: 'rejected' } : p))
        if (viewPost?.id === postId) setViewPost(null)
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

  // ── External backend actions ──
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

  const handleDeleteLocalPost = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this post?')) return
    setActionLoading(id + '_delete')
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setLocalPosts(prev => prev.filter(p => p.id !== id))
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

  const getAllImgUrls = (images: any[]): string[] => {
    if (!images?.length) return []
    return images.map(img => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
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

  // Convert local non-pending posts into Property shape for the table
  // Skip ones that were successfully forwarded to external backend (backendId matches an external _id)
  const externalIds = new Set(properties.map(p => p._id))
  const localAsProps: Property[] = localPosts
    .filter(lp => lp.status !== 'pending') // pending already shown in pending section
    .filter(lp => !(lp as any).backendId || !externalIds.has((lp as any).backendId))
    .map(lp => {
      const loc = typeof lp.location === 'string'
        ? { city: lp.location, area: '' }
        : { city: (lp.location as any)?.city || '', area: (lp.location as any)?.area || '' }
      return {
        _id: lp.id,
        title: lp.title,
        description: lp.description || '',
        price: lp.price,
        location: loc,
        propertyType: lp.propertyType || lp.type || '',
        type: lp.type,
        bedrooms: lp.bedrooms ?? undefined,
        images: lp.images,
        status: lp.status === 'approved' ? 'active' : lp.status,
        createdAt: lp.createdAt,
      } as Property
    })

  const localPostIds = new Set(localAsProps.map(p => p._id).filter(Boolean))
  const allPosts = [...localAsProps, ...properties]

  const filtered = allPosts.filter(p => {
    const s = (p.status || 'active').toLowerCase()
    const matchStatus = statusFilter === 'all' || s === statusFilter || (statusFilter === 'active' && s === 'approved')
    const matchSearch = !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      (p.location as any)?.city?.toLowerCase().includes(search.toLowerCase()) ||
      (p.location as any)?.area?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const tabCounts = {
    all: allPosts.length,
    active: allPosts.filter(p => ['active', 'approved'].includes((p.status || 'active').toLowerCase())).length,
    pending: allPosts.filter(p => (p.status || '').toLowerCase() === 'pending').length,
    rejected: allPosts.filter(p => (p.status || '').toLowerCase() === 'rejected').length,
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

      {/* ══ Full Post View Modal ══ */}
      {viewPost && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setViewPost(null) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Post Review</h2>
                <p className="text-xs text-slate-400 mt-0.5">Submitted by {viewPost.userName} · {viewPost.userEmail}</p>
              </div>
              <button
                onClick={() => setViewPost(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
              >
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Images Gallery */}
            {getAllImgUrls(viewPost.images).length > 0 ? (
              <>
                <div className="relative bg-slate-900">
                  <img
                    src={getAllImgUrls(viewPost.images)[viewImageIdx]}
                    alt={`Image ${viewImageIdx + 1}`}
                    className="w-full h-72 object-cover"
                  />
                  {getAllImgUrls(viewPost.images).length > 1 && (
                    <>
                      <button
                        onClick={() => setViewImageIdx(i => Math.max(0, i - 1))}
                        disabled={viewImageIdx === 0}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center disabled:opacity-30 transition-all"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setViewImageIdx(i => Math.min(getAllImgUrls(viewPost.images).length - 1, i + 1))}
                        disabled={viewImageIdx === getAllImgUrls(viewPost.images).length - 1}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center disabled:opacity-30 transition-all"
                      >
                        ›
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {getAllImgUrls(viewPost.images).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setViewImageIdx(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === viewImageIdx ? 'bg-white' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                      <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                        {viewImageIdx + 1} / {getAllImgUrls(viewPost.images).length}
                      </span>
                    </>
                  )}
                </div>
                {/* Thumbnail strip */}
                {getAllImgUrls(viewPost.images).length > 1 && (
                  <div className="flex gap-2 px-6 py-3 overflow-x-auto bg-slate-50 border-b border-slate-100">
                    {getAllImgUrls(viewPost.images).map((url, i) => (
                      <button key={i} onClick={() => setViewImageIdx(i)} className="flex-shrink-0">
                        <img
                          src={url}
                          alt=""
                          className={`w-14 h-12 rounded-lg object-cover transition-all ${i === viewImageIdx ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {/* Videos below images */}
                {viewPost.videos && viewPost.videos.length > 0 && (
                  <div className="px-6 py-4 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Videos ({viewPost.videos.length})</p>
                    <div className="flex flex-col gap-3">
                      {viewPost.videos.map((url, i) => (
                        <video key={i} src={url} controls className="w-full rounded-xl border border-slate-200 max-h-56" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : viewPost.videos && viewPost.videos.length > 0 ? (
              /* Video-only post — show videos prominently at top */
              <div className="bg-slate-900">
                <div className="flex flex-col gap-1">
                  {viewPost.videos.map((url, i) => (
                    <video key={i} src={url} controls className="w-full max-h-72 object-contain" preload="metadata" />
                  ))}
                </div>
                <div className="px-4 py-2 text-center">
                  <span className="text-xs text-slate-400 font-medium">🎥 {viewPost.videos.length} video{viewPost.videos.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            ) : null}

            {/* Post Details */}
            <div className="px-6 py-5 space-y-4">
              {/* Title + badges */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-lg capitalize">{viewPost.type}</span>
                  {viewPost.propertyType && (
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-lg capitalize">{viewPost.propertyType}</span>
                  )}
                  {viewPost.furnished && (
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-lg">Furnished</span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">{viewPost.title}</h3>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {viewPost.price !== null && viewPost.price !== undefined && (
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{Number(viewPost.price).toLocaleString()} EGP</p>
                  </div>
                )}
                {viewPost.bedrooms != null && (
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Beds</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">🛏 {viewPost.bedrooms}</p>
                  </div>
                )}
                {viewPost.bathrooms != null && (
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Baths</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">🚿 {viewPost.bathrooms}</p>
                  </div>
                )}
                {viewPost.area != null && (
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Area</p>
                    <p className="text-sm font-extrabold text-slate-900 mt-0.5">{viewPost.area} m²</p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-slate-700">{getLocation(viewPost.location)}</p>
              </div>

              {/* Description */}
              {viewPost.description && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{viewPost.description}</p>
                </div>
              )}

              {/* Amenities */}
              {viewPost.amenities && viewPost.amenities.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {viewPost.amenities.map(a => (
                      <span key={a} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-lg font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences / Target */}
              {((viewPost.preferences && viewPost.preferences.length > 0) || viewPost.targetAudience) && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {viewPost.targetAudience && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg font-medium">{viewPost.targetAudience}</span>
                    )}
                    {viewPost.preferences?.map(p => (
                      <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {viewPost.whatsapp?.number && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="text-sm text-slate-700">+{viewPost.whatsapp.countryCode} {viewPost.whatsapp.number}</span>
                </div>
              )}

              {/* Submitted date */}
              <p className="text-xs text-slate-400">
                Submitted: {viewPost.createdAt ? new Date(viewPost.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>

            {/* Modal Footer — Actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                onClick={() => handleApproveLocal(viewPost.id)}
                disabled={!!approveLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all"
              >
                {approveLoading === viewPost.id + '_approve' ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Approve
              </button>
              <button
                onClick={() => { setViewPost(null); openRejectModal(viewPost.id, viewPost.title) }}
                disabled={!!approveLoading}
                className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => setViewPost(null)}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
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
            <p className="text-sm text-slate-600 mb-3">The user will receive an email and in-app notification with this reason.</p>
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

      {/* ══ Pending Posts ══ */}
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
              <p className="text-xs text-slate-500">Click a post to review full content — user gets email &amp; notification on decision</p>
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
              <div
                key={post.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50/50 transition-colors cursor-pointer group"
                onClick={() => { setViewImageIdx(0); setViewPost(post) }}
              >
                {getImgUrl(post.images) ? (
                  <img src={getImgUrl(post.images)} alt="" className="w-16 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : post.videos && post.videos.length > 0 ? (
                  <div className="w-16 h-14 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0 text-xl">🎥</div>
                ) : (
                  <div className="w-16 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-2xl">🏠</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">{post.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    by <span className="font-semibold">{post.userName || post.userEmail}</span>
                    {' · '}{getLocation(post.location)}
                    {post.price ? ` · ${Number(post.price).toLocaleString()} EGP` : ''}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="hidden sm:inline text-xs font-semibold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-lg capitalize">
                    {post.type}
                  </span>
                  {/* Media badges */}
                  {post.images?.length > 0 && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">📷 {post.images.length}</span>
                  )}
                  {post.videos && post.videos.length > 0 && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">🎥 {post.videos.length}</span>
                  )}
                  {/* View button */}
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-all">
                    View →
                  </span>
                  {/* Quick actions (stop propagation) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleApproveLocal(post.id) }}
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
                    onClick={(e) => { e.stopPropagation(); openRejectModal(post.id, post.title) }}
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
                            <p className="text-[11px] text-slate-400">{(prop._id || '').slice(-6)}</p>
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
                            onClick={() => localPostIds.has(prop._id) ? handleDeleteLocalPost(prop._id) : handleDeleteProperty(prop._id)}
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
