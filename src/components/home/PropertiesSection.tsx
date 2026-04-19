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
  videos?: string[];
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
      const [extRes, localRes] = await Promise.all([
        fetch(`${API_URL}/api/properties?limit=6&sort=-createdAt`, {
          headers: { 'Content-Type': 'application/json' },
        }).catch(() => null),
        fetch('/api/posts', { cache: 'no-store' }).catch(() => null),
      ])

      let all: Property[] = []

      if (extRes?.ok) {
        const data = await extRes.json()
        if (data.success && data.properties) {
          const active = data.properties.filter((p: any) => {
            const s = (p.status || 'active').toLowerCase()
            return s === 'active' || s === 'approved'
          })
          all = active
        }
      }

      if (localRes?.ok) {
        const localData = await localRes.json()
        if (localData.success && localData.posts?.length) {
          const extIds = new Set(all.map((p: any) => p._id))
          const localProps = localData.posts
            .filter((p: any) => !p.backendId || !extIds.has(p.backendId))
            .map((p: any) => ({
              _id: p.id,
              title: p.title,
              description: p.description,
              price: p.price,
              location: typeof p.location === 'string'
                ? { city: p.location, area: '' }
                : p.location,
              bedrooms: p.bedrooms,
              bathrooms: p.bathrooms,
              area: p.area,
              images: (p.images || []).map((img: any) =>
                typeof img === 'string' ? { url: img } : img
              ),
              videos: (p.videos || []).map((v: any) => typeof v === 'string' ? v : v?.url || '').filter(Boolean),
              propertyType: p.propertyType,
              type: p.type,
            }))
          all = [...all, ...localProps]
        }
      }

      const sorted = [...all].sort((a: any, b: any) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )
      setProperties(sorted.slice(0, 6))
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
        <div className="flex items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight whitespace-nowrap">
            {t('properties.latestBadge')}
          </h2>
          <Link href="/properties" className="group flex-shrink-0 flex items-center gap-3 text-slate-900 font-black hover:text-primary transition-all">
            {t('properties.viewAll')} <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {properties.map((property) => (
              <Link
                href={`/properties/${property._id}`}
                key={property._id}
                className="group block"
              >
                {/* Airbnb-style square image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                  {property.images && property.images.length > 0 ? (
                    <Image
                      src={getImageUrl(property.images)}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : property.videos && property.videos.length > 0 ? (
                    <>
                      <video src={property.videos[0]} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-slate-100">🏠</div>
                  )}

                  {/* Heart button */}
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="absolute top-3 right-3 z-10" aria-label="Save">
                    <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {property.featured && (
                    <div className="absolute top-3 left-3 bg-white text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
                      ★ {t('properties.featuredBadge')}
                    </div>
                  )}
                </div>

                {/* Airbnb-style info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{property.title}</h3>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">
                        {[property.location?.area, property.location?.city].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-gray-400 text-xs">{property.bedrooms || 0} bed · {property.bathrooms || 0} bath</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs flex-shrink-0 pt-0.5">
                      <FaStar className="text-gray-900 w-3 h-3" />
                      <span className="font-semibold text-gray-900">New</span>
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <span className="font-semibold text-sm text-gray-900">{property.price?.toLocaleString()} EGP</span>
                    <span className="text-gray-500 text-xs"> /month</span>
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