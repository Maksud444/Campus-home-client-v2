'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Property {
  _id: string
  title: string
  description: string
  price: number
  location: {
    city: string
    area: string
    address: string
  }
  propertyType: string
  bedrooms: number
  bathrooms: number
  area: number
  images: Array<{ url: string }>
  amenities: string[]
  whatsapp: {
    countryCode: string
    number: string
  }
  status: string
  isDeleted: boolean
  deletedAt?: string
  permanentDeleteAt?: string
  userId: {
    _id: string
    name: string
    email: string
    avatar: string
  }
  views: number
  likes: string[]
  createdAt: string
}

export default function PropertiesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/api/properties`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProperties(data.properties)
      } else {
        throw new Error(data.message || 'Failed to fetch properties')
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
    if (filters.city && property.location.city !== filters.city) return false
    if (filters.propertyType && property.propertyType !== filters.propertyType) return false
    if (filters.minPrice && property.price < parseInt(filters.minPrice)) return false
    if (filters.maxPrice && property.price > parseInt(filters.maxPrice)) return false
    if (filters.bedrooms && property.bedrooms !== parseInt(filters.bedrooms)) return false
    return true
  })

  const getRemainingDays = (permanentDeleteAt?: string) => {
    if (!permanentDeleteAt) return 0
    const now = new Date()
    const deleteDate = new Date(permanentDeleteAt)
    const diffTime = deleteDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading properties...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Browse Properties 🏠
          </h1>
          <p className="text-gray-600 text-lg">
            Find your perfect home in Egypt
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">City</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input text-sm"
              >
                <option value="">All Cities</option>
                <option value="Cairo">Cairo</option>
                <option value="Giza">Giza</option>
                <option value="Alexandria">Alexandria</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="input text-sm"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="studio">Studio</option>
                <option value="room">Room</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Min Price</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="input text-sm"
                placeholder="Min"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Max Price</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="input text-sm"
                placeholder="Max"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Bedrooms</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="input text-sm"
              >
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => setFilters({ city: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' })}
            className="btn btn-outline mt-4 text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found <span className="font-bold text-primary">{filteredProperties.length}</span> properties
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters</p>
            <Link href="/post" className="btn btn-primary">
              Add Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => {
              const isOwner = session?.user?.email === property.userId?.email
              const remainingDays = getRemainingDays(property.permanentDeleteAt)
              const whatsappLink = property.whatsapp 
                ? `https://wa.me/${property.whatsapp.countryCode}${property.whatsapp.number}`
                : null

              return (
                <div
                  key={property._id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow relative ${
                    property.isDeleted ? 'opacity-75' : ''
                  }`}
                >
                  {/* Deleted Badge */}
                  {property.isDeleted && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        ⚠️ Not Available
                        {remainingDays > 0 && (
                          <div className="text-xs mt-1">
                            Deletes in {remainingDays} day{remainingDays !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <Link href={`/properties/${property._id}`} className="block relative h-56 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🏠
                      </div>
                    )}

                    {/* Property Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold capitalize">
                        {property.propertyType}
                      </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link href={`/properties/${property._id}`}>
                      <h3 className="font-bold text-xl mb-2 hover:text-primary line-clamp-2">
                        {property.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>📍</span>
                      <span>{property.location.area}, {property.location.city}</span>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {property.bedrooms && (
                        <span>🛏️ {property.bedrooms} BR</span>
                      )}
                      {property.bathrooms && (
                        <span>🚿 {property.bathrooms} BA</span>
                      )}
                      {property.area && (
                        <span>📐 {property.area} m²</span>
                      )}
                    </div>

                    {/* Price */}
                    {property.price && (
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {property.price.toLocaleString()} EGP
                          <span className="text-sm text-gray-600 font-normal">/month</span>
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>👁️ {property.views || 0} views</span>
                      <span>❤️ {property.likes?.length || 0} likes</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {property.isDeleted && isOwner ? (
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`${API_URL}/api/properties/${property._id}/restore`, {
                                method: 'POST'
                              })
                              const data = await response.json()
                              if (data.success) {
                                alert('Property restored successfully!')
                                fetchProperties()
                              }
                            } catch (error) {
                              console.error('Restore error:', error)
                            }
                          }}
                          className="btn btn-primary flex-1 text-sm"
                        >
                          ♻️ Restore
                        </button>
                      ) : (
                        <Link
                          href={`/properties/${property._id}`}
                          className="btn btn-primary flex-1 text-sm text-center"
                        >
                          View Details
                        </Link>
                      )}

                      {whatsappLink && (
                        
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline flex-1 text-sm"
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}