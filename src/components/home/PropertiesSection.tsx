'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaArrowRight, FaStar } from 'react-icons/fa'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

// Interface unchanged...
interface Property {
  _id: string; title: string; description: string; price: number | null;
  location: { city: string; area: string; address?: string };
  bedrooms?: number; bathrooms?: number; area?: number;
  images: Array<{ url: string; public_id?: string } | string>;
  propertyType: string; featured?: boolean;
}

export default function PropertiesSection() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProperties() }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      const response = await fetch(`${API_URL}/api/properties?limit=6`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      })
      clearTimeout(timeoutId)
      const data = await response.json()
      if (data.success && data.properties) setProperties(data.properties)
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

  // Modern Loading Skeleton
  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-[2.5rem] h-[500px] bg-slate-100 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-3 block">Premium Listings</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Featured <span className="text-primary">Living Spaces</span>
            </h2>
            <p className="mt-4 text-slate-500 font-medium text-lg">
              Carefully curated student housing options designed for comfort and success.
            </p>
          </div>
          <Link href="/properties" className="group flex items-center gap-3 text-slate-900 font-black hover:text-primary transition-all">
            See All Listings <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {properties.map((property) => (
              <Link
                href={`/properties/${property._id}`}
                key={property._id}
                className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={getImageUrl(property.images)}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {property.featured && (
                      <div className="bg-primary text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                        <FaStar size={10} className="text-yellow-300" />
                        Featured
                      </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {property.propertyType || 'Apartment'}
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-6 left-6">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl shadow-xl">
                      <span className="text-xl font-black">
                        {property.price?.toLocaleString()} 
                        <span className="text-xs font-normal opacity-70 ml-1">EGP/mo</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-400 mb-6">
                    <FaMapMarkerAlt className="text-primary/60 flex-shrink-0" />
                    <span className="text-sm font-medium line-clamp-1">
                      {property.location?.area}, {property.location?.city}
                    </span>
                  </div>

                  {/* Amenities - Modern Icon Set */}
                  <div className="mt-auto grid grid-cols-3 gap-4 pt-6 border-t border-slate-50 text-slate-600">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaBed size={16} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tighter opacity-60">{property.bedrooms || 0} Beds</span>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaBath size={16} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tighter opacity-60">{property.bathrooms || 0} Baths</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaRulerCombined size={14} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tighter opacity-60">{property.area || 0}m²</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="text-7xl mb-6 grayscale opacity-50">🏠</div>
            <h3 className="text-3xl font-black text-slate-900 mb-3">No active listings</h3>
            <p className="text-slate-500 max-w-sm mx-auto">We're currently updating our catalog. Please check back in a few hours!</p>
          </div>
        )}

        {/* View All Button - Footer */}
        <div className="mt-20 flex justify-center">
          <Link href="/properties" className="px-12 py-5 bg-slate-900 text-white rounded-full font-black hover:bg-primary transition-all shadow-2xl shadow-slate-200 flex items-center gap-4 group">
            Explore All 500+ Properties
            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}