'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface Property {
  _id: string
  userId: string
  userName: string
  userImage: string
  userRole: string
  title: string
  description: string
  type: string
  price: number | null
  location: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  amenities: string[]
  images: string[]
  propertyType: string
  furnished: boolean
  likes: any[]
  views: number
  status: string
  createdAt: string
  updatedAt: string
  targetAudience?: string
}

export default function PropertiesPage() {
  const { data: session } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [audienceFilter, setAudienceFilter] = useState('all')

  useEffect(() => {
    fetchProperties()
  }, [filter, audienceFilter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const url = filter === 'all' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/properties` 
        : `http://localhost:5000/api/properties?type=${filter}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        let filteredProps = data.properties
        
        if (audienceFilter !== 'all' && filter === 'property') {
          filteredProps = filteredProps.filter((prop: any) => 
            prop.targetAudience === audienceFilter
          )
        }
        
        setProperties(filteredProps)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (propId: string) => {
    if (!session) {
      alert('Please login to like properties')
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/properties/${propId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (session?.user as any)?._id || session.user.email?.split('@')[0],
          userName: session.user?.name || 'Anonymous'
        })
      })

      const data = await response.json()

      if (data.success) {
        setProperties(properties.map(prop => 
          prop._id === propId ? { ...prop, likes: data.property.likes } : prop
        ))
      }
    } catch (error) {
      console.error('Error liking property:', error)
    }
  }

  const isLiked = (property: Property) => {
    if (!session?.user) return false
    const userId = (session.user as any)._id || session.user.email?.split('@')[0]
    return property.likes?.some((like: any) => like.userId === userId)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Browse Properties
          </h1>
          <p className="text-gray-600 text-lg">
            Find your perfect home or roommate
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏠 All Posts
            </button>
            <button
              onClick={() => setFilter('property')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'property'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏢 Properties
            </button>
            <button
              onClick={() => setFilter('roommate')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'roommate'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              👥 Roommates
            </button>
            <button
              onClick={() => setFilter('room')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === 'room'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🔍 Looking for Room
            </button>
          </div>

          {/* Audience Filters */}
          {filter === 'property' && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setAudienceFilter('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  audienceFilter === 'all'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Audiences
              </button>
              <button
                onClick={() => setAudienceFilter('students')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  audienceFilter === 'students'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                🎓 For Students
              </button>
              <button
                onClick={() => setAudienceFilter('family')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  audienceFilter === 'family'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                👨‍👩‍👧‍👦 For Family
              </button>
            </div>
          )}
        </div>

        {/* Add Post Button */}
        {session && (
          <div className="mb-8">
            <Link href="/post" className="btn btn-primary inline-block">
              ➕ Create New Post
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading properties...</p>
          </div>
        )}

        {/* No Properties */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">Be the first to create a post!</p>
            {session && (
              <Link href="/post" className="btn btn-primary">
                Create Post
              </Link>
            )}
          </div>
        )}

        {/* Properties Grid */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property._id} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                {/* Image */}
                <Link href={`/properties/${property._id}`} className="block relative h-56 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title || 'Property'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                      🏠
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      property.type === 'property' ? 'bg-blue-500 text-white' :
                      property.type === 'roommate' ? 'bg-green-500 text-white' :
                      'bg-purple-500 text-white'
                    }`}>
                      {property.type === 'property' ? '🏢 Property' :
                       property.type === 'roommate' ? '👥 Roommate' :
                       '🔍 Looking'}
                    </span>
                    
                    {property.targetAudience && property.type === 'property' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        property.targetAudience === 'family' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {property.targetAudience === 'family' ? '👨‍👩‍👧‍👦' : '🎓'}
                      </span>
                    )}
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleLike(property._id)
                    }}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                  >
                    <span className="text-xl">
                      {isLiked(property) ? '❤️' : '🤍'}
                    </span>
                  </button>
                </Link>

                {/* Content */}
                <div className="p-5">
                  {/* User Info */}
                  <div className="flex items-center gap-2 mb-3">
                    {property.userImage ? (
                      <Image
                        src={property.userImage}
                        alt={property.userName || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {property.userName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {property.userName || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {property.userRole || 'user'}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <Link href={`/properties/${property._id}`}>
                    <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                      {property.title || 'Untitled Property'}
                    </h3>
                  </Link>

                  {/* Location */}
                  <p className="text-gray-600 text-sm mb-3 flex items-center gap-1">
                    📍 {property.location || 'Location not specified'}
                  </p>

                  {/* Details */}
                  {property.type === 'property' && (
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      {property.bedrooms && <span>🛏️ {property.bedrooms} BD</span>}
                      {property.bathrooms && <span>🚿 {property.bathrooms} BA</span>}
                      {property.area && <span>📐 {property.area} sqm</span>}
                    </div>
                  )}

                  {/* Price & Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    {property.price ? (
                      <div className="text-primary font-bold text-xl">
                        {property.price.toLocaleString()} EGP
                        <span className="text-sm text-gray-600">/mo</span>
                      </div>
                    ) : (
                      <div className="text-gray-600 text-sm">Price negotiable</div>
                    )}
                    
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>👁️ {property.views || 0}</span>
                      <span>❤️ {property.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}