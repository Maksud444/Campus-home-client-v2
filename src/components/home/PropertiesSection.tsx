'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Bed, Bath, Maximize, Home, Users } from 'lucide-react'

interface Property {
  _id: string
  title: string
  description: string
  type: string
  price: number | null
  location: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  images: string[]
  propertyType: string
  featured?: boolean
}

export default function PropertiesSection() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchProperties()
  }, [filter])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const url = filter === 'all' 
        ? `${API_URL}/api/properties?limit=6` 
        : `${API_URL}/api/properties?type=${filter}&limit=6`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.slice(0, 6)

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
          <p className="text-gray-600 text-lg">
            Discover the best student accommodations in Egypt
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Properties
          </button>
          <button
            onClick={() => setFilter('property')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'property'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Home className="inline mr-2" size={18} />
            Properties
          </button>
          <button
            onClick={() => setFilter('roommate')}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === 'roommate'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="inline mr-2" size={18} />
            Roommates
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading properties...</p>
          </div>
        )}

        {/* No Properties */}
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">Check back later for new listings!</p>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && filteredProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <Link
                href={`/properties/${property._id}`}
                key={property._id}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-64">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title || 'Property'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-6xl">
                      🏠
                    </div>
                  )}
                  {property.featured && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">
                    {property.title || 'Untitled Property'}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{property.location || 'Location not specified'}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center">
                        <Bed size={16} className="mr-1" />
                        <span>{property.bedrooms} BD</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center">
                        <Bath size={16} className="mr-1" />
                        <span>{property.bathrooms} BA</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center">
                        <Maximize size={16} className="mr-1" />
                        <span>{property.area} sqm</span>
                      </div>
                    )}
                  </div>

                  {property.price && (
                    <div className="text-2xl font-bold text-primary">
                      {property.price.toLocaleString()} EGP
                      <span className="text-sm text-gray-600">/mo</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        {!loading && filteredProperties.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/properties" className="btn btn-primary inline-block">
              View All Properties
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}