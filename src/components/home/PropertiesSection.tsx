'use client'

import { useState } from 'react'
import Link from 'next/link'
import { properties } from '@/data/properties'
import { MapPin, Bed, Bath, Maximize, Home, Users } from 'lucide-react'
import { useStaggerCards } from '@/hooks/useGsapAnimations'

export default function PropertiesSection() {
  const [activeTab, setActiveTab] = useState<'apartment' | 'studio' | 'room'>('apartment')
  
  // Filter properties based on active tab
  const getFilteredProperties = () => {
    let filtered = properties
    
    switch(activeTab) {
      case 'apartment':
        // Full apartments (2+ bedrooms)
        filtered = properties.filter(p => 
          (p.type === 'apartment' || p.type === 'villa') && p.bedrooms >= 2
        )
        break
      case 'studio':
        // 1 bedroom / Studio
        filtered = properties.filter(p => 
          p.type === 'studio' || (p.type === 'apartment' && p.bedrooms === 1)
        )
        break
      case 'room':
        // Shared rooms
        filtered = properties.filter(p => p.type === 'room')
        break
    }
    
    return filtered.slice(0, 6)
  }

  const displayProperties = getFilteredProperties()
  const cardsRef = useStaggerCards([displayProperties])

  const tabs = [
    {
      id: 'apartment' as const,
      label: 'Full Apartment',
      icon: Home,
      description: '2+ Bedrooms'
    },
    {
      id: 'studio' as const,
      label: '1 Bedroom',
      icon: Bed,
      description: 'Studio & 1BR'
    },
    {
      id: 'room' as const,
      label: 'Share Roommate',
      icon: Users,
      description: 'Shared Rooms'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Latest Properties</h2>
          <p className="text-xl text-gray-600">
            Find your perfect student accommodation
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-12 max-w-4xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-xl scale-105'
                    : 'bg-white text-gray-700 hover:shadow-lg hover:scale-102'
                }`}
              >
                <div className="relative z-10 p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                      activeTab === tab.id
                        ? 'bg-white/20'
                        : 'bg-primary/10'
                    }`}>
                      <Icon 
                        size={28} 
                        className={activeTab === tab.id ? 'text-white' : 'text-primary'}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{tab.label}</h3>
                  <p className={`text-sm ${
                    activeTab === tab.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </p>
                </div>
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50" />
                )}
              </button>
            )
          })}
        </div>

        {/* Properties Count */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600">
            Showing <span className="font-bold text-primary">{displayProperties.length}</span> properties
          </p>
        </div>

        {/* Properties Grid */}
        {displayProperties.length > 0 ? (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {displayProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100 hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {property.verified && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ Verified
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-primary text-white px-4 py-1 rounded-full font-bold">
                    {property.price} EGP/mo
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin size={16} className="text-primary flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{property.area}, {property.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed size={16} />
                      <span className="text-sm">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath size={16} />
                      <span className="text-sm">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Maximize size={16} />
                      <span className="text-sm">{property.size} sqm</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs capitalize">
                      {property.type}
                    </span>
                    {property.furnished && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                        Furnished
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No properties available</h3>
            <p className="text-gray-600 mb-6">
              We're adding more {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} options soon!
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link 
            href={`/properties?type=${activeTab}`} 
            className="btn btn-primary btn-lg hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            <span>View All {tabs.find(t => t.id === activeTab)?.label}</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}