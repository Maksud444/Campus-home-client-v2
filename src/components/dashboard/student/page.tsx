'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function StudentDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    // Check if user is student
    if (session?.user?.role !== 'student') {
      router.push(`/dashboard/${session?.user?.role}`)
      return
    }

    // Load dashboard data
    loadDashboard()
  }, [session, status, router])

  const loadDashboard = async () => {
    if (!session?.accessToken) {
      console.log('⚠️ No access token found')
      setLoading(false)
      return
    }

    try {
      console.log('📊 Loading student dashboard...')
      const response = await fetch(`${API_URL}/api/dashboard/student`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      console.log('✅ Dashboard data:', data)

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
    totalBookings: 0,
    activeBookings: 0,
    savedProperties: 0,
    pendingBookings: 0
  }

  const savedProperties = dashboardData?.savedProperties || []
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

          {/* User Info */}
          <div className="mb-8 p-4 bg-bg-light rounded-xl">
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <Image 
                  src={session.user.image} 
                  alt={session.user.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {session.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-bold text-gray-900">{session.user.name}</div>
                <div className="text-sm text-gray-600 capitalize">{session.user.role}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link href="/dashboard/student" className="flex items-center gap-3 px-4 py-3 bg-bg-light text-primary rounded-xl font-semibold">
              <span className="text-xl">🏠</span>
              <span>Dashboard</span>
            </Link>
            <Link href="/post" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">➕</span>
              <span>Create Post</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">📝</span>
              <span>My Bookings</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold transition-colors">
              <span className="text-xl">❤️</span>
              <span>Saved Properties</span>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome Back, {session.user.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">Here's your student dashboard overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">📝</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{stats.totalBookings}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">✅</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{stats.activeBookings}</div>
            <div className="text-gray-600">Active Bookings</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">❤️</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{stats.savedProperties}</div>
            <div className="text-gray-600">Saved Properties</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div className="text-primary text-2xl mb-2">⏳</div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{stats.pendingBookings}</div>
            <div className="text-gray-600">Pending</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/post" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all flex items-center gap-3">
              <span className="text-3xl">➕</span>
              <div>
                <div className="font-bold">Create Post</div>
                <div className="text-sm text-white/80">Find roommate or room</div>
              </div>
            </Link>
            <Link href="/properties" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <div className="font-bold">Browse Properties</div>
                <div className="text-sm text-white/80">Find your perfect home</div>
              </div>
            </Link>
            <Link href="/services/plumbing" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl p-4 transition-all flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              <div>
                <div className="font-bold">Book Service</div>
                <div className="text-sm text-white/80">Plumber, electrician, etc</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 ? (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Bookings</h2>
            <div className="space-y-4">
              {recentBookings.map((booking: any) => (
                <div key={booking._id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">
                        {booking.property?.title || booking.service?.name || 'Booking'}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        📍 {booking.property?.location?.city || 'N/A'}
                      </p>
                      <div className="text-sm text-gray-600">
                        Price: <span className="font-bold text-primary">{booking.price} EGP</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-md mb-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
            <p className="text-gray-600 mb-6">Start by browsing properties or services</p>
            <Link href="/properties" className="btn btn-primary">
              Browse Properties
            </Link>
          </div>
        )}

        {/* Saved Properties */}
        {savedProperties.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedProperties.slice(0, 3).map((property: any) => (
                <div key={property._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    {property.images && property.images[0] && (
                      <Image 
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2 line-clamp-1">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      📍 {property.location?.city || 'N/A'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-xl">{property.price} EGP</span>
                      <Link href={`/properties/${property._id}`} className="btn btn-primary text-sm">
                        View
                      </Link>
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