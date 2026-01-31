'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt } from 'react-icons/fa'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Property {
  _id: string
  title: string
  description: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  images: string[]
  propertyType: string
  featured?: boolean
}

// Fallback sample properties
const SAMPLE_PROPERTIES: Property[] = [
  {
    _id: '1',
    title: 'Modern 2BR Apartment in Nasr City',
    description: 'Beautiful apartment near Cairo University',
    price: 4500,
    location: 'Nasr City, Cairo',
    bedrooms: 2,
    bathrooms: 1,
    area: 120,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    propertyType: 'apartment',
    featured: true
  },
  {
    _id: '2',
    title: 'Cozy Studio in Maadi',
    description: 'Perfect for students, fully furnished',
    price: 3000,
    location: 'Maadi, Cairo',
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    propertyType: 'studio',
    featured: true
  },
  {
    _id: '3',
    title: 'Spacious 3BR near AUC',
    description: 'Close to American University in Cairo',
    price: 6000,
    location: 'New Cairo',
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    propertyType: 'apartment',
    featured: true
  },
]

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
      } else {
        console.log('⚠️ No properties from API, using samples')
        setProperties(SAMPLE_PROPERTIES)
      }
    } catch (err: any) {
      console.error('❌ Properties fetch error:', err.message)
      console.log('💡 Using sample properties due to API error')
      setProperties(SAMPLE_PROPERTIES)
    } finally {
      setLoading(false)
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Link
              href={`/properties/${property._id}`}
              key={property._id}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={property.images[0] || '/placeholder.jpg'}
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
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {property.description}
                </p>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <FaMapMarkerAlt className="text-primary" />
                  <span className="text-sm">{property.location}</span>
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
                    <span className="text-2xl font-bold text-primary">
                      {property.price ? `${property.price.toLocaleString()} EGP` : 'Price on request'}
                    </span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/properties" className="btn btn-primary">
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  )
}