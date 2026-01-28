'use client'

import { useState, useEffect } from 'react'
import { MapPin, Bed, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectsSection() {
  const [activeCity, setActiveCity] = useState('cairo')
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const cities = [
    { id: 'cairo', label: 'Cairo' },
    { id: 'giza', label: 'Giza' },
    { id: 'alexandria', label: 'Alexandria' },
    { id: 'north-coast', label: 'North Coast' },
    { id: 'suez', label: 'Suez' },
    { id: 'port-saeed', label: 'Port Saeed' },
  ]

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'
        
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
    p.location?.toLowerCase().includes(activeCity)
  ).slice(0, 6)

  const handleWhatsApp = (project: any) => {
    const message = `Hi! I'm interested in ${project.title} at ${project.area}, ${project.location}. Price: ${project.price} EGP`
    const phoneNumber = '201234567890'
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
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
                    src={project.images?.[0] || 'https://via.placeholder.com/600x400'}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-gray-600 mb-4">
                    <MapPin size={16} className="flex-shrink-0 mt-1 text-primary" />
                    <span className="text-sm line-clamp-2">
                      {project.area}, {project.location}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed size={16} />
                      <span>{project.bedrooms} Beds</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>📐</span>
                      <span className="capitalize">{project.type}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Price:</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {project.price.toLocaleString()} EGP
                    </p>
                  </div>

                  {/* WhatsApp Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleWhatsApp(project)
                    }}
                    className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>
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
            <span>View Properties</span>
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}