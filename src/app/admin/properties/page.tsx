'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Property {
  _id: string
  title: string
  description: string
  price: number | null
  location: { city: string; area: string; address?: string }
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  images: Array<{ url: string } | string>
  type: string
  status: string
  createdAt: string
  userId?: { name: string; email: string } | string
}

type StatusFilter = 'all' | 'active' | 'pending' | 'rejected'

function PropertiesContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const initialStatus = (searchParams.get('status') as StatusFilter) || 'all'

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialStatus)
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const token = (session?.user as any)?.backendToken

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY) headers['X-Admin-Key'] = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY
      const res = await fetch(`${API_URL}/api/properties?limit=200`, { headers })
      const data = await res.json()
      if (data.success && data.properties) setProperties(data.properties)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchProperties() }, [fetchProperties])

  const filtered = properties.filter(p => {
    const matchStatus = statusFilter === 'all' || (p.status || 'active').toLowerCase() === statusFilter
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.area?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleApprove = async (id: string) => {
    setActionLoading(id + '_approve')
    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ? { 'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY } : {}) },
        body: JSON.stringify({ status: 'active' }),
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

  const handleReject = async (id: string) => {
    setActionLoading(id + '_reject')
    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ? { 'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY } : {}) },
        body: JSON.stringify({ status: 'rejected' }),
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this property?')) return
    setActionLoading(id + '_delete')
    try {
      const res = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, ...(process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY ? { 'X-Admin-Key': process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY } : {}) },
      })
      const data = await res.json()
      if (data.success || res.ok) {
        setProperties(prev => prev.filter(p => p._id !== id))
        showToast('Property deleted', 'success')
      } else {
        showToast(data.message || 'Failed to delete', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      approved: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
      inactive: 'bg-slate-100 text-slate-600',
    }
    return map[status?.toLowerCase()] || 'bg-slate-100 text-slate-600'
  }

  const getImageUrl = (images: any[]) => {
    if (!images?.length) return null
    const first = images[0]
    return typeof first === 'string' ? first : first?.url
  }

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
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-white font-semibold text-sm transition-all ${
          toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Properties Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Approve, reject or delete property listings</p>
        </div>
        <button onClick={fetchProperties} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5 flex flex-col md:flex-row gap-3">
        {/* Search */}
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
        {/* Status Tabs */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          {(['all', 'active', 'pending', 'rejected'] as StatusFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${
                statusFilter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s} ({tabCounts[s]})
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
            <div className="text-5xl mb-3">🏠</div>
            <p className="text-slate-500 font-medium">No properties found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Property</th>
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
                  const imgUrl = getImageUrl(prop.images as any[])
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
                            <p className="font-semibold text-slate-900 text-sm line-clamp-1 max-w-[160px]">{prop.title}</p>
                            <p className="text-[11px] text-slate-400">{prop._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{prop.location?.area}, {prop.location?.city}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-slate-900">{prop.price ? `${prop.price.toLocaleString()} EGP` : 'N/A'}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg capitalize">{prop.propertyType || prop.type || 'N/A'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${getStatusBadge(prop.status)}`}>
                          {prop.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(prop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* View */}
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

                          {/* Approve */}
                          {status !== 'active' && status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(prop._id)}
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

                          {/* Reject */}
                          {status !== 'rejected' && (
                            <button
                              onClick={() => handleReject(prop._id)}
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

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(prop._id)}
                            disabled={actionLoading === prop._id + '_delete'}
                            className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all disabled:opacity-50"
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
        {!loading && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
            Showing {filtered.length} of {properties.length} properties
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminPropertiesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-4 border-primary" /></div>}>
      <PropertiesContent />
    </Suspense>
  )
}
