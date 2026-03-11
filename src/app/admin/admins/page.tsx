'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface AdminUser {
  id: string
  name: string
  email: string
  createdAt: string
  createdBy: string
  isActive: boolean
}

interface ApprovedPost {
  id: string
  title: string
  approved_at: string
  userEmail: string
  backendId?: string
  approved_by_name?: string
  approved_by?: string
}

export default function AdminsManagementPage() {
  const { data: session } = useSession()
  const isMainAdmin = (session?.user as any)?.id === 'local-admin'

  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [approvedPosts, setApprovedPosts] = useState<ApprovedPost[]>([])
  const [expandedAdmin, setExpandedAdmin] = useState<string | null>(null)

  // Create admin form
  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  // Delete loading
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/admins')
      const data = await res.json()
      if (data.success) setAdmins(data.admins || [])
    } catch {
      setAdmins([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?admin=true')
      const data = await res.json()
      if (data.success) {
        const approved = (data.posts || []).filter((p: any) => p.status === 'approved' && p.approved_by_name)
        setApprovedPosts(approved.map((p: any) => ({
          id: p.id,
          title: p.title || 'Untitled',
          approved_at: p.approved_at || p.updatedAt || '',
          userEmail: p.userEmail || '',
          backendId: p.backendId,
          approved_by_name: p.approved_by_name,
          approved_by: p.approved_by,
        })))
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchAdmins(); fetchPosts() }, [fetchAdmins, fetchPosts])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, email: createEmail, password: createPassword }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Admin created successfully', 'success')
        setShowCreate(false)
        setCreateName(''); setCreateEmail(''); setCreatePassword('')
        fetchAdmins()
      } else {
        showToast(data.message || 'Failed to create admin', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDelete = async (admin: AdminUser) => {
    if (!confirm(`Delete admin "${admin.name}" (${admin.email})? They will no longer be able to log in.`)) return
    setDeleteLoading(admin.id)
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Admin removed', 'success')
        setAdmins(prev => prev.filter(a => a.id !== admin.id))
      } else {
        showToast(data.message || 'Failed to delete', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetTarget) return
    setResetLoading(true)
    try {
      const res = await fetch(`/api/admin/admins/${resetTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPassword }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Password reset successfully', 'success')
        setResetTarget(null)
        setResetPassword('')
      } else {
        showToast(data.message || 'Failed to reset password', 'error')
      }
    } catch {
      showToast('Network error', 'error')
    } finally {
      setResetLoading(false)
    }
  }

  // Current admin (self) for non-main admins
  const currentAdminId = (session?.user as any)?.id
  const selfAdmin = admins.find(a => a.id === currentAdminId)

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
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isMainAdmin ? 'Create, manage and remove admin accounts' : 'Manage your admin account'}
          </p>
        </div>
        {isMainAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Admin
          </button>
        )}
      </div>

      {/* Main Admin Card (always shown) */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-extrabold text-slate-900 text-base">{process.env.NEXT_PUBLIC_ADMIN_NAME || 'Main Admin'}</p>
              <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Main Admin</span>
            </div>
            <p className="text-sm text-slate-500">{process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@baytino.com'}</p>
            <p className="text-xs text-slate-400 mt-1">Password managed via Coolify environment variables</p>
          </div>
          {isMainAdmin && (
            <div className="text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg">
              You are logged in as Main Admin
            </div>
          )}
        </div>
      </div>

      {/* Non-main admin: show own reset password option */}
      {!isMainAdmin && selfAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">Your Admin Account</p>
              <p className="text-sm text-slate-500">{selfAdmin.email}</p>
            </div>
            <button
              onClick={() => setResetTarget(selfAdmin)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Reset My Password
            </button>
          </div>
        </div>
      )}

      {/* Admins List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-bold text-slate-900">Admin Accounts ({admins.length})</p>
          <button onClick={fetchAdmins} className="text-xs text-slate-500 hover:text-primary transition-colors font-medium">
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : admins.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">👤</div>
            <p className="text-slate-700 font-bold mb-1">No additional admins</p>
            <p className="text-slate-400 text-sm">Create a new admin using the button above.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {admins.map(admin => {
              const adminPosts = approvedPosts.filter(p =>
                p.approved_by_name === admin.name || p.approved_by === admin.id || p.approved_by === admin.email
              )
              const isExpanded = expandedAdmin === admin.id
              return (
                <div key={admin.id} className="transition-colors">
                  {/* Admin row */}
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 text-sm font-extrabold flex-shrink-0">
                      {admin.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">{admin.name}</p>
                        <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Admin</span>
                        {admin.id === currentAdminId && (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{admin.email}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-slate-400">
                          Created {new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <button
                          onClick={() => setExpandedAdmin(isExpanded ? null : admin.id)}
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {adminPosts.length} posts approved
                          <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(isMainAdmin || admin.id === currentAdminId) && (
                        <button
                          onClick={() => { setResetTarget(admin); setResetPassword('') }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all"
                          title="Reset password"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Reset
                        </button>
                      )}
                      {isMainAdmin && (
                        <button
                          onClick={() => handleDelete(admin)}
                          disabled={deleteLoading === admin.id}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all disabled:opacity-50"
                          title="Remove admin"
                        >
                          {deleteLoading === admin.id ? (
                            <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Approved posts panel */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Posts Approved by {admin.name}
                      </p>
                      {adminPosts.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No posts approved yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {adminPosts.map(post => (
                            <div key={post.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-slate-100">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{post.title}</p>
                                <p className="text-xs text-slate-400">
                                  {post.approved_at ? new Date(post.approved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                                  {post.userEmail ? ` · ${post.userEmail}` : ''}
                                </p>
                              </div>
                              <Link
                                href={`/properties/${post.backendId || post.id}`}
                                target="_blank"
                                className="ml-3 text-xs text-primary font-semibold hover:underline flex-shrink-0"
                              >
                                View →
                              </Link>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900">Create New Admin</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  required
                  placeholder="Admin Name"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={e => setCreateEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating...</>
                  ) : 'Create Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Reset Password</h2>
                <p className="text-sm text-slate-500">{resetTarget.name} — {resetTarget.email}</p>
              </div>
              <button onClick={() => { setResetTarget(null); setResetPassword('') }} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={e => setResetPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setResetTarget(null); setResetPassword('') }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Resetting...</>
                  ) : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
