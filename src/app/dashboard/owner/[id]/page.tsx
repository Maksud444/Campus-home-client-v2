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
}

export default function OwnerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const urlUserId = params.id as string

  const [isVerifying, setIsVerifying] = useState(true)
  const [myProperties, setMyProperties] = useState<Post[]>([])
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

        if (userRole !== 'owner') {
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
        
        fetchMyProperties(sessionUserId)
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

  const fetchMyProperties = async (userId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts?userId=${userId}`)
      const data = await response.json()

      if (data.success) {
        setMyProperties(data.posts)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setMyProperties(myProperties.filter(post => post.id !== postId))
        alert('Property deleted successfully')
      } else {
        alert(data.message || 'Failed to delete property')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Failed to delete property')
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

  const displayName = userName || session.user?.name || 'Owner'
  const totalProperties = myProperties.length
  const totalRevenue = myProperties.reduce((sum, post) => sum + (post.price || 0), 0)
  const rentedProperties = myProperties.filter(p => p.likes && p.likes.length > 0).length
  const availableProperties = totalProperties - rentedProperties
  const occupancyRate = totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back, {displayName}! 🏡
          </h1>
          <p className="text-gray-600 text-lg">Property Owner Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">🏠</div>
            <div className="text-3xl font-extrabold text-primary">{totalProperties}</div>
            <div className="text-gray-600 font-semibold">Total Properties</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-2xl font-extrabold text-green-600">
              {totalRevenue.toLocaleString()}
              <span className="text-sm text-gray-600"> EGP</span>
            </div>
            <div className="text-gray-600 font-semibold">Potential Revenue</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-extrabold text-primary">{rentedProperties}</div>
            <div className="text-gray-600 font-semibold">With Interest</div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-extrabold text-primary">{occupancyRate}%</div>
            <div className="text-gray-600 font-semibold">Interest Rate</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Property Performance</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Properties Listed</span>
                <span className="font-bold text-primary">{totalProperties}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Properties with Interest</span>
                <span className="font-bold text-green-600">{rentedProperties}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${occupancyRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-gray-700">Available Properties</span>
                <span className="font-bold text-blue-600">{availableProperties}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${100 - occupancyRate}%` }}
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
            <div className="text-xl font-bold mb-2">Add New Property</div>
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
            <h2 className="text-2xl font-extrabold text-gray-900">My Properties</h2>
            {totalProperties > 0 && (
              <Link href="/post" className="btn btn-primary">
                ➕ Add New Property
              </Link>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your properties...</p>
            </div>
          ) : myProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties yet</h3>
              <p className="text-gray-600 mb-6">Add your first property to get started!</p>
              <Link href="/post" className="btn btn-primary">
                Add Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map((property) => (
                <div key={property.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/properties/${property.id}`} className="block relative h-48 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🏠
                      </div>
                    )}
                    
                    {property.likes && property.likes.length > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {property.likes.length} Interested
                        </span>
                      </div>
                    )}
                  </Link>

                  <div className="p-4">
                    <Link href={`/properties/${property.id}`}>
                      <h3 className="font-bold text-lg mb-2 hover:text-primary line-clamp-2">
                        {property.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-600 mb-3">📍 {property.location}</p>

                    {property.price && (
                      <div className="text-primary font-bold text-xl mb-3">
                        {property.price.toLocaleString()} EGP
                        <span className="text-sm text-gray-600">/mo</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>👁️ {property.views || 0}</span>
                      <span>❤️ {property.likes?.length || 0}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/properties/${property.id}/edit`}
                        className="btn btn-outline text-sm flex-1"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        className="btn btn-outline text-sm flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}