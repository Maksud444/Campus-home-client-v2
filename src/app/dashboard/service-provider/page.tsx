'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function ServiceProviderDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user?.role !== 'service-provider') {
      router.push(`/dashboard/${session?.user?.role}`)
      return
    }

    loadDashboard()
  }, [session, status, router])

  const loadDashboard = async () => {
    if (!session?.accessToken) {
      setLoading(false)
      return
    }

    try {
      console.log('📊 Loading service provider dashboard...')
      const response = await fetch(`${API_URL}/api/dashboard/service-provider`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('✅ Service Provider Dashboard data:', data)

      if (response.ok && data.success) {
        setDashboardData(data.data)
      } else {
        console.error('❌ Failed to load dashboard:', data.message)
      }
    } catch (error) {
      console.error('❌ Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || !session.user) {
    return null
  }

  const stats = dashboardData?.stats || {
    totalServices: 0,
    activeServices: 0,
    completedJobs: 0,
    averageRating: 0
  }

  const services = dashboardData?.services || []
  const recentBookings = dashboardData?.recentBookings || []

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-2xl">
              C
            </div>
            <span className="text-2xl font-bold text-primary">Campus Home</span>
          </Link>

          <div className="mb-8 p-4 bg-bg-light rounded-xl">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-bold text-gray-900">{session.user.name}</div>
                <div className="text-sm text-gray-600">Service Provider</div>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard/service-provider" className="flex items-center gap-3 px-4 py-3 bg-bg-light text-primary rounded-xl font-semibold">
              <span className="text-xl">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">🔧</span>
              <span>My Services</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">➕</span>
              <span>Add Service</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">📋</span>
              <span>Bookings</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">💬</span>
              <span>Messages</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors text-left"
            >
              <span className="text-xl">🚪</span>
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Service Provider Dashboard 🔧</h1>
          <p className="text-gray-600 text-lg">Manage your services and bookings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">🔧</div>
            <div className="text-4xl font-extrabold mb-1">{stats.totalServices}</div>
            <div className="text-blue-100">Total Services</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-4xl font-extrabold mb-1">{stats.activeServices}</div>
            <div className="text-green-100">Active Services</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">💼</div>
            <div className="text-4xl font-extrabold mb-1">{stats.completedJobs}</div>
            <div className="text-purple-100">Completed Jobs</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-4xl font-extrabold mb-1">{stats.averageRating.toFixed(1)}</div>
            <div className="text-orange-100">Average Rating</div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
            <button className="btn btn-primary">+ Add New Service</button>
          </div>

          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service: any) => (
                <div key={service._id} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-primary">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                      <p className="text-gray-600 text-sm capitalize">📍 {service.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      service.status === 'active' ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {service.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Price Range</div>
                    <div className="text-lg font-bold text-primary">
                      {service.priceRange?.min} - {service.priceRange?.max} EGP
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{service.rating || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {service.reviews?.length || 0} reviews
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 btn btn-outline text-sm py-2">View</button>
                    <button className="flex-1 btn btn-primary text-sm py-2">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No services yet</h3>
              <p className="text-gray-600 mb-6">Start by adding your first service</p>
              <button className="btn btn-primary">+ Add Service</button>
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div key={booking._id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                        {booking.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold">{booking.user?.name || 'User'}</div>
                        <div className="text-sm text-gray-600">{booking.service?.name || 'Service'}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                      <button className="btn btn-primary text-sm">View</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}