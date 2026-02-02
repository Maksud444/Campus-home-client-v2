'use client'

import { useState, useEffect } from 'react'
import { MapPin, Bed, Calendar } from 'lucide-react'
import Link from 'next/link'

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
  images: Array<{ url: string; public_id?: string } | string>
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  type: string
  createdAt: string
}

export default function NewProjectsSection() {
  const [activeCity, setActiveCity] = useState('Cairo')
  const [projects, setProjects] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const cities = [
    { id: 'Cairo', label: 'Cairo' },
    { id: 'Giza', label: 'Giza' },
    { id: 'Alexandria', label: 'Alexandria' },
    { id: 'Mansoura', label: 'Mansoura' },
  ]

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        console.log('📥 Fetching properties from backend...')
        
        const response = await fetch(`${API_URL}/api/properties?limit=12`)
        const data = await response.json()

        if (data.success && data.properties) {
          console.log('✅ Properties loaded:', data.properties.length)
          setProjects(data.properties)
        }
      } catch (error) {
        console.error('❌ Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Filter by city
  const filteredProjects = projects.filter(p => 
    p.location?.city === activeCity
  ).slice(0, 6)

  const getImageUrl = (images: any[]): string => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/600x400'
    const firstImage = images[0]
    return typeof firstImage === 'string' ? firstImage : firstImage?.url || 'https://via.placeholder.com/600x400'
  }

  const getPostedDate = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Posted today'
    if (diffDays === 1) return 'Posted 1 day ago'
    if (diffDays < 7) return `Posted ${diffDays} days ago`
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`
    return `Posted ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl text-gray-600">Loading properties...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Browse by Location
          </h2>
          <p className="text-lg text-gray-600">
            Find student accommodations in your preferred area
          </p>
        </div>

        {/* City Tabs */}
        <div className="flex flex-wrap gap-4 mb-10 border-b-2 border-gray-200">
          {cities.map((city) => (
            <button
              key={city.id}
              onClick={() => setActiveCity(city.id)}
              className={`px-4 py-3 font-semibold transition-all relative ${
                activeCity === city.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {city.label}
              {activeCity === city.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900" />
              )}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredProjects.map((project) => (
              <Link
                key={project._id}
                href={`/properties/${project._id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group"
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={getImageUrl(project.images)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Posted Date */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                      <Calendar size={14} />
                      {getPostedDate(project.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {project.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-gray-600 mb-4">
                    <MapPin size={16} className="flex-shrink-0 mt-1 text-primary" />
                    <span className="text-sm line-clamp-1">
                      {project.location?.area}, {project.location?.city}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {project.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed size={16} />
                        <span>{project.bedrooms} Beds</span>
                      </div>
                    )}
                    {project.propertyType && (
                      <div className="flex items-center gap-1">
                        <span>🏠</span>
                        <span className="capitalize">{project.propertyType}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  {project.price && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-1">Monthly Rent:</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {project.price.toLocaleString()} EGP
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No properties found</h3>
            <p className="text-gray-600">
              No properties available in {cities.find(c => c.id === activeCity)?.label}
            </p>
          </div>
        )}

        {/* View Properties Button */}
        <div className="text-center">
          <Link 
            href="/properties" 
            className="inline-flex items-center gap-2 text-gray-900 font-bold hover:text-primary transition-colors text-lg group"
          >
            <span>View All Properties</span>
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}