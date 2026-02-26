'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Stats {
  totalProperties: number
  totalPosts: number
  totalUsers: number
  pendingProperties: number
}

interface RecentProperty {
  _id: string
  title: string
  location: { city: string; area: string }
  price: number | null
  propertyType: string
  status: string
  createdAt: string
}

export default function AdminOverviewPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({ totalProperties: 0, totalPosts: 0, totalUsers: 0, pendingProperties: 0 })
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = (session?.user as any)?.backendToken
    fetchData(token)
  }, [session])

  const fetchData = async (token?: string) => {
    setLoading(true)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const [propsRes, postsRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/properties?limit=100`, { headers }),
        fetch(`${API_URL}/api/posts?limit=100`, { headers }),
      ])

      let totalProperties = 0, pendingProperties = 0, recentProps: RecentProperty[] = []
      let totalPosts = 0

      if (propsRes.status === 'fulfilled') {
        const data = await propsRes.value.json()
        if (data.success && data.properties) {
          totalProperties = data.properties.length
          pendingProperties = data.properties.filter((p: any) => p.status === 'pending').length
          recentProps = data.properties.slice(0, 6)
        }
      }
      if (postsRes.status === 'fulfilled') {
        const data = await postsRes.value.json()
        if (data.success && data.posts) totalPosts = data.posts.length
      }

      // Try admin users endpoint
      let totalUsers = 0
      try {
        const usersRes = await fetch(`${API_URL}/api/admin/users`, { headers })
        const usersData = await usersRes.json()
        if (usersData.success && usersData.users) totalUsers = usersData.users.length
      } catch {}

      setStats({ totalProperties, totalPosts, totalUsers, pendingProperties })
      setRecentProperties(recentProps)
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Total Properties',
      value: stats.totalProperties,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      color: 'bg-blue-500',
      light: 'bg-blue-50 text-blue-600',
      href: '/admin/properties',
    },
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-emerald-500',
      light: 'bg-emerald-50 text-emerald-600',
      href: '/admin/users',
    },
    {
      label: 'Total Posts',
      value: stats.totalPosts,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-violet-500',
      light: 'bg-violet-50 text-violet-600',
      href: '/admin/posts',
    },
    {
      label: 'Pending Approval',
      value: stats.pendingProperties,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-amber-500',
      light: 'bg-amber-50 text-amber-600',
      href: '/admin/properties?status=pending',
    },
  ]

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">Welcome back, {session?.user?.name || 'Admin'}. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => (
            <Link key={card.label} href={card.href} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.light}`}>
                  {card.icon}
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{card.value.toLocaleString()}</div>
              <div className="text-sm font-medium text-slate-500">{card.label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Link href="/admin/properties" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">Manage Properties</p>
            <p className="text-xs text-slate-500 mt-0.5">Approve, reject or delete listings</p>
          </div>
        </Link>
        <Link href="/admin/users" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">Manage Users</p>
            <p className="text-xs text-slate-500 mt-0.5">View, update roles, and delete accounts</p>
          </div>
        </Link>
        <Link href="/admin/posts" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all group flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">Manage Posts</p>
            <p className="text-xs text-slate-500 mt-0.5">Review and remove user posts</p>
          </div>
        </Link>
      </div>

      {/* Recent Properties */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-extrabold text-slate-900">Recent Properties</h2>
          <Link href="/admin/properties" className="text-sm text-primary font-semibold hover:underline">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : recentProperties.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <p className="text-slate-500">No properties found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Property</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Location</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Price</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentProperties.map((prop) => (
                  <tr key={prop._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 text-sm line-clamp-1 max-w-[200px]">{prop.title}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{prop.location?.area}, {prop.location?.city}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{prop.price?.toLocaleString() || 'N/A'} EGP</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg capitalize">{prop.propertyType || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg capitalize ${getStatusBadge(prop.status)}`}>
                        {prop.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(prop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
