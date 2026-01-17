'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getProvidersByServiceAndLocation } from '@/data/serviceProviders'
import { ArrowLeft, Phone, Star, MapPin, Award, DollarSign, CheckCircle } from 'lucide-react'

export default function ProvidersPage() {
  const params = useParams()
  const service = params.service as string
  const location = params.location as string
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const serviceInfo: Record<string, { name: string; icon: string }> = {
    plumbing: { name: 'Plumbing Services', icon: '🔧' },
    electrical: { name: 'Electrical Services', icon: '⚡' },
    cleaning: { name: 'Cleaning Services', icon: '🧹' },
    ac: { name: 'AC Repair', icon: '❄️' },
    painting: { name: 'Painting Services', icon: '🎨' },
    carpentry: { name: 'Carpentry Services', icon: '🪚' },
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  const locationName = location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const providers = getProvidersByServiceAndLocation(service, locationName)
  const info = serviceInfo[service]

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Service not found</h1>
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-6">
          <Link 
            href={`/services/${service}`} 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Locations</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-5xl">{info.icon}</span>
            <div>
              <h1 className="text-3xl font-bold mb-2">{info.name}</h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin size={20} />
                <span className="text-xl">{locationName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Available Providers ({providers.length})
          </h2>
        </div>

        {/* Providers List */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <div 
                key={provider.id} 
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-primary"
              >
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <img 
                    src={provider.image} 
                    alt={provider.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{provider.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-800">{provider.rating}</span>
                          </div>
                          {provider.available && (
                            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-sm">
                              <CheckCircle size={14} />
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{provider.description}</p>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Award size={18} className="text-primary" />
                    <span className="font-semibold">{provider.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <DollarSign size={18} className="text-primary" />
                    <span className="font-semibold">{provider.price}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-primary" />
                    <span className="font-semibold">{provider.location}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-2">
                    {provider.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call Button */}
                <button
                  onClick={() => handleCall(provider.phone)}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <Phone size={20} />
                  <span>Call {provider.phone}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-600 text-xl mb-4">No providers available in {locationName} yet.</p>
            <p className="text-gray-500 mb-6">We're working on expanding our network!</p>
            <Link 
              href={`/services/${service}`} 
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <ArrowLeft size={20} />
              Try another location
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}