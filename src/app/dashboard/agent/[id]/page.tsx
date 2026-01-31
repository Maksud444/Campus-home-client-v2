'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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

export default function AgentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const urlUserId = params.id as string

  const [isVerifying, setIsVerifying] = useState(true)
  const [myListings, setMyListings] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

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

        if (userRole !== 'agent') {
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
        
        fetchMyListings(sessionUserId)
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

  const fetchMyListings = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setMyListings(data.posts)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setMyListings(myListings.filter(post => post.id !== postId))
        alert('Listing deleted successfully')
      } else {
        alert(data.message || 'Failed to delete listing')
      }
    } catch (error) {
      console.error('Error deleting listing:', error)
      alert('Failed to delete listing')
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

  const displayName = userName || session.user?.name || 'Agent'
  const totalListings = myListings.length
  const totalViews = myListings.reduce((sum, post) => sum + (post.views || 0), 0)
  const totalInquiries = myListings.reduce((sum, post) => sum + (post.likes?.length || 0), 0)
  const avgRating = 4.8

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back, {displayName}! 🏢
          </h1>
          <p className="text-gray-600 text-lg">Agent Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">🏢</div>
            <div className="text-3xl font-extrabold text-primary">{totalListings}</div>
            <div className="text-gray-600 font-semibold">Active Listings</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">👁️</div>
            <div className="text-3xl font-extrabold text-primary">{totalViews.toLocaleString()}</div>
            <div className="text-gray-600 font-semibold">Total Views</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-3xl font-extrabold text-primary">{totalInquiries}</div>
            <div className="text-gray-600 font-semibold">Inquiries</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-extrabold text-primary">{avgRating}</div>
            <div className="text-gray-600 font-semibold">Rating</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Monthly Performance</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Views This Month</span>
                <span className="font-bold text-primary">{totalViews}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((totalViews / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Inquiries This Month</span>
                <span className="font-bold text-primary">{totalInquiries}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((totalInquiries / 50) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Active Listings</span>
                <span className="font-bold text-primary">{totalListings}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((totalListings / 30) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/post"
            className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">➕</div>
            <div className="text-xl font-bold mb-2">Add New Listing</div>
            <div className="text-sm opacity-90">List a new property</div>
          </Link>

          <Link
            href="/properties"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-xl font-bold mb-2">Browse Properties</div>
            <div className="text-sm opacity-90">View all listings</div>
          </Link>

          <Link
            href="/settings"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-transform"
          >
            <div className="text-4xl mb-3">⚙️</div>
            <div className="text-xl font-bold mb-2">Settings</div>
            <div className="text-sm opacity-90">Manage your account</div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">My Property Listings</h2>
            {totalListings > 0 && (
              <Link href="/post" className="btn btn-primary">
                ➕ Add New Listing
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your listings...</p>
            </div>
          ) : myListings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Add your first property listing to get started!</p>
              <Link href="/post" className="btn btn-primary">
                Add Listing
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Property</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Location</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Price</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Views</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Inquiries</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {listing.images && listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                              🏠
                            </div>
                          )}
                          <div>
                            <Link 
                              href={`/properties/${listing.id}`}
                              className="font-semibold hover:text-primary line-clamp-1"
                            >
                              {listing.title}
                            </Link>
                            <div className="text-xs text-gray-500">
                              Posted {new Date(listing.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {listing.location}
                      </td>
                      <td className="py-4 px-4">
                        {listing.price ? (
                          <span className="font-bold text-primary">
                            {listing.price.toLocaleString()} EGP
                          </span>
                        ) : (
                          <span className="text-gray-500">Negotiable</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">{listing.views || 0}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold">{listing.likes?.length || 0}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/properties/${listing.id}/edit`}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            ✏️ Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}