'use client'

import Link from 'next/link'
import { locations } from '@/data/locations'
import { useStaggerCards } from '@/hooks/useGsapAnimations'
import { MapPin, Home, ArrowRight } from 'lucide-react'

export default function LocationsSection() {
  const cardsRef = useStaggerCards([locations])

  return (
    <section className="py-24 bg-[#F8FAFC]"> {/* হালকা অফ-হোয়াইট ব্যাকগ্রাউন্ড */}
      <div className="container mx-auto px-6">
        
        {/* Header - Left Aligned for Modern Look */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
              Exploration
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Browse by <span className="text-primary">Location</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              Find the perfect student accommodations in Egypt's most vibrant neighborhoods.
            </p>
          </div>
          
          <Link href="/properties" className="hidden md:flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group">
            Explore All Areas <ArrowRight size={20} />
          </Link>
        </div>

        {/* Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <Link
              key={location.id}
              href={`/properties?location=${location.slug}`}
              className="group relative h-[450px] rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              {/* Background Image */}
              <img
                src={location.image}
                alt={location.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 group-hover:to-primary/60 transition-colors duration-500" />
              
              {/* Property Count Badge (Top Right) */}
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-white text-sm font-bold flex items-center gap-2">
                <Home size={14} />
                {location.propertyCount} Properties
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 transform group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-2 text-white/80 mb-2">
                  <MapPin size={18} className="text-primary-light" />
                  <span className="text-xs font-bold uppercase tracking-widest">Egypt</span>
                </div>
                
                <h3 className="text-3xl font-black text-white mb-4">
                  {location.name}
                </h3>
                
                {/* Revealable Button on Hover */}
                <div className="flex items-center gap-3 text-white font-bold opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <span className="bg-white text-primary p-2 rounded-full">
                    <ArrowRight size={20} />
                  </span>
                  <span>Explore Properties</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile Only View All Button */}
        <div className="mt-12 md:hidden">
          <Link href="/properties" className="flex items-center justify-center gap-2 bg-white border-2 border-slate-100 py-4 rounded-2xl text-slate-900 font-bold">
            View All Locations <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}