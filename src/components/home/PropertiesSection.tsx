'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Property {
  _id: string
  title: string
  description: string
  price: number | null
  location: {
    city: string
    area: string
    address?: string
  }
  bedrooms?: number
  bathrooms?: number
  area?: number
  images: Array<{ url: string; public_id?: string } | string>
  propertyType: string
  featured?: boolean
}

export default function PropertiesSection() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      console.log('📡 Fetching properties from:', `${API_URL}/api/properties?limit=6`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(`${API_URL}/api/properties?limit=6`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Properties fetched:', data)

      if (data.success && data.properties && data.properties.length > 0) {
        setProperties(data.properties)
      }
    } catch (err: any) {
      console.error('❌ Properties fetch error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return '/placeholder.jpg'
    const firstImage = images[0]
    return typeof firstImage === 'string' ? firstImage : firstImage?.url || '/placeholder.jpg'
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
            <p className="text-gray-600">Loading available properties...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Featured Properties</h2>
          <p className="text-gray-600">Discover the best student housing options</p>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <Link
                href={`/properties/${property._id}`}
                key={property._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={getImageUrl(property.images)}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {property.featured && (
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {property.description}
                  </p>

                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <FaMapMarkerAlt className="text-primary flex-shrink-0" />
                    <span className="text-sm line-clamp-1">
                      {property.location?.area}, {property.location?.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {property.bedrooms && (
                        <div className="flex items-center gap-1">
                          <FaBed className="text-primary" />
                          <span>{property.bedrooms}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-1">
                          <FaBath className="text-primary" />
                          <span>{property.bathrooms}</span>
                        </div>
                      )}
                      {property.area && (
                        <div className="flex items-center gap-1">
                          <FaRulerCombined className="text-primary" />
                          <span>{property.area}m²</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      {property.price ? (
                        <>
                          <span className="text-2xl font-bold text-primary">
                            {property.price.toLocaleString()} EGP
                          </span>
                          <span className="text-gray-600 text-sm">/month</span>
                        </>
                      ) : (
                        <span className="text-lg font-semibold text-gray-600">
                          Price on request
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold mb-2">No properties available</h3>
            <p className="text-gray-600">Check back soon for new listings</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/properties" className="btn btn-primary">
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  )
}