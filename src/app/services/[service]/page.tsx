'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { serviceLocations } from '@/data/serviceProviders'
import { MapPin, Search } from 'lucide-react'

export default function ServicePage() {
  const params = useParams()
  const service = params.service as string
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const serviceInfo: Record<string, { name: string; icon: string; description: string }> = {
    plumbing: {
      name: 'Plumbing Services',
      icon: '🔧',
      description: 'Professional plumbers for repairs, installations, and maintenance'
    },
    electrical: {
      name: 'Electrical Services',
      icon: '⚡',
      description: 'Licensed electricians for all your electrical needs'
    },
    cleaning: {
      name: 'Cleaning Services',
      icon: '🧹',
      description: 'Professional cleaning services for your home or office'
    },
    ac: {
      name: 'AC Repair',
      icon: '❄️',
      description: 'Expert AC repair and maintenance services'
    },
    painting: {
      name: 'Painting Services',
      icon: '🎨',
      description: 'Professional painting for interior and exterior'
    },
    carpentry: {
      name: 'Carpentry Services',
      icon: '🪚',
      description: 'Expert carpenters for custom work and repairs'
    },
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const info = serviceInfo[service]

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Service not found</h1>
          <p className="text-gray-600 mb-6">Available services: plumbing, electrical, cleaning, ac, painting, carpentry</p>
          <Link href="/" className="text-primary hover:underline font-semibold">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const filteredLocations = serviceLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{info.icon}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{info.name}</h1>
              <p className="text-white/90 text-lg">{info.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search location..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Select Your Location
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((location) => (
            <Link
              key={location.name}
              href={`/services/${service}/${location.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-primary group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                    <MapPin className="text-primary group-hover:text-white" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-primary transition-colors">
                      {location.name}
                    </h3>
                    <p className="text-gray-600">
                      {location.count} providers available
                    </p>
                  </div>
                </div>
                <div className="text-primary text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No locations found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  )
}