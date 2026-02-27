'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaBed, FaBath, FaRulerCombined, FaMapMarkerAlt, FaArrowRight, FaStar } from 'react-icons/fa'
import { useLanguage } from '@/contexts/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

// Interface updated with type property
interface Property {
  _id: string; title: string; description: string; price: number | null;
  location: { city: string; area: string; address?: string };
  bedrooms?: number; bathrooms?: number; area?: number;
  images: Array<{ url: string; public_id?: string } | string>;
  propertyType: string; type?: string; featured?: boolean;
}

export default function PropertiesSection() {
  const { t } = useLanguage()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProperties() }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      const response = await fetch(`${API_URL}/api/properties?limit=6&sort=-createdAt`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
      })
      clearTimeout(timeoutId)
      const data = await response.json()
      if (data.success && data.properties) {
        // Sort by newest first
        const sorted = [...data.properties].sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setProperties(sorted)
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

  // Modern Loading Skeleton
  if (loading) {
    return (
      <section className="py-10 bg-white rounded-2xl mx-3 mb-3 overflow-hidden">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl h-72 bg-slate-100 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-white rounded-2xl mx-3 mb-3 overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div className="max-w-xl">
            <span className="text-primary font-bold tracking-widest uppercase text-xs mb-1.5 block">{t('properties.latestBadge')}</span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {t('properties.featuredPosts')}
            </h2>
            <p className="mt-2 text-slate-500 font-medium text-sm">
              {t('properties.premiumDesc')}
            </p>
          </div>
          <Link href="/properties" className="group flex items-center gap-3 text-slate-900 font-black hover:text-primary transition-all">
            {t('properties.viewAll')} <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {properties.map((property) => (
              <Link
                href={`/properties/${property._id}`}
                key={property._id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative h-48 w-full overflow-hidden">
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
                        {t('properties.featuredBadge')}
                      </div>
                    )}
                    <div className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {t(`propertyType.${(property.type || property.propertyType || 'property').toLowerCase()}`)}
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl shadow-xl">
                      <span className="text-sm font-black">
                        {property.price?.toLocaleString()} 
                        <span className="text-xs font-normal opacity-70 ml-1">{t('properties.egpPerMonth')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-400 mb-3">
                    <FaMapMarkerAlt className="text-primary/60 flex-shrink-0" />
                    <span className="text-sm font-medium line-clamp-1">
                      {property.location?.area}, {property.location?.city}
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="mt-auto grid grid-cols-3 gap-2 pt-3 border-t border-slate-50 text-slate-600">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaBed size={14} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{property.bedrooms || 0}</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaBath size={14} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{property.bathrooms || 0}</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <FaRulerCombined size={13} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">{property.area || 0}m²</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-4 grayscale opacity-50">🏠</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{t('properties.noListings')}</h3>
            <p className="text-slate-500 max-w-sm mx-auto">{t('properties.noListingsDesc')}</p>
          </div>
        )}

        {/* View All Button */}
        <div className="mt-8 flex justify-center">
          <Link href="/properties" className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-primary transition-all shadow-lg flex items-center gap-3 group">
            {t('properties.exploreAll')}
            <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}