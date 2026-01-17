'use client'

import Link from 'next/link'
import { locations } from '@/data/locations'
import { useStaggerCards } from '@/hooks/useGsapAnimations'
import { MapPin, Home } from 'lucide-react'

export default function LocationsSection() {
  const cardsRef = useStaggerCards([locations])

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Browse by Location</h2>
          <p className="text-xl text-gray-600">
            Find student accommodations in your preferred area
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {locations.map((location) => (
            <Link
              key={location.id}
              href={`/properties?location=${location.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-gray-100 hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Location Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <MapPin size={20} />
                    <h3 className="text-2xl font-bold">{location.name}</h3>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Home size={20} className="text-primary" />
                    <span className="text-lg font-semibold">{location.propertyCount} Properties</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                  <span>View Properties</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}