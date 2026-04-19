'use client'

import { useState, useEffect } from 'react'
import { MapPin, Bed, ArrowRight, Building2, Layers } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

// Interfaces unchanged...
interface Property {
  _id: string; title: string; description: string; price: number | null;
  location: { city: string; area: string; address?: string };
  images: Array<{ url: string; public_id?: string } | string>;
  videos?: string[];
  propertyType: string; bedrooms?: number; bathrooms?: number; type: string; createdAt: string;
}

export default function NewProjectsSection() {
  const { t } = useLanguage()
  const [activeCity, setActiveCity] = useState('Cairo')
  const [projects, setProjects] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  const cities = [
    { id: 'Cairo', label: 'Cairo' },
    { id: 'Giza', label: 'Giza' },
    { id: 'Alexandria', label: 'Alexandria' },
    { id: 'Mansoura', label: 'Mansoura' },
    { id: '', label: t('newProjects.allCities') },
  ]

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const [extRes, localRes] = await Promise.all([
          fetch(`${API_URL}/api/properties?limit=12`).catch(() => null),
          fetch('/api/posts', { cache: 'no-store' }).catch(() => null),
        ])

        let all: Property[] = []

        if (extRes?.ok) {
          const data = await extRes.json()
          if (data.success && data.properties) all = data.properties
        }

        if (localRes?.ok) {
          const localData = await localRes.json()
          if (localData.success && localData.posts?.length) {
            const extIds = new Set(all.map((p: any) => p._id))

            // Merge videos from approved local posts into matching external backend posts
            const localByBackendId = new Map<string, any>()
            localData.posts.forEach((p: any) => {
              if (p.backendId && p.videos?.length > 0) localByBackendId.set(p.backendId, p)
            })
            if (localByBackendId.size > 0) {
              all = all.map((p: any) => {
                const local = localByBackendId.get(p._id)
                return local && !p.videos?.length ? { ...p, videos: local.videos } : p
              })
            }

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
                images: (p.images || []).map((img: any) =>
                  typeof img === 'string' ? { url: img } : img
                ),
                videos: (p.videos || []).map((v: any) => typeof v === 'string' ? v : v?.url || '').filter(Boolean),
                propertyType: p.propertyType,
                type: p.type,
                createdAt: p.createdAt,
              }))
            all = [...all, ...localProps]
          }
        }

        all.sort((a: any, b: any) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        setProjects(all)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const filteredProjects = (activeCity === ''
    ? projects
    : projects.filter(p => p.location?.city === activeCity)
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
    if (diffDays === 0) return t('newProjects.today')
    if (diffDays < 30) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 30)}m ago`
  }

  // Modern Skeleton Loader
  if (loading) {
    return (
      <section className="py-10 bg-slate-50 rounded-2xl mx-3 mb-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-slate-50 rounded-2xl mx-3 mb-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Title — always on left */}
          <div className="space-y-1">
            <span className="text-primary font-bold tracking-widest uppercase text-xs">{t('newProjects.locationBadge')}</span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              {t('newProjects.locationTitle')} <span className="text-primary">{t('newProjects.locationHighlight')}</span>
            </h2>
          </div>

          {/* Mobile: native dropdown */}
          <div className="md:hidden flex-shrink-0">
            <select
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.label}</option>
              ))}
            </select>
          </div>

          {/* Desktop: pill tabs */}
          <div className="hidden md:flex p-1.5 bg-white shadow-sm border border-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => setActiveCity(city.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold transition-all duration-300 ${
                  activeCity === city.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid — Airbnb style */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
            {filteredProjects.map((project) => (
              <Link key={project._id} href={`/properties/${project._id}`} className="group block">
                {/* Square image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
                  {project.images && project.images.length > 0 ? (
                    <img src={getImageUrl(project.images)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : project.videos && project.videos.length > 0 ? (
                    <>
                      <video src={project.videos[0]} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl bg-slate-100">🏠</div>
                  )}

                  {/* Heart */}
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }} className="absolute top-3 right-3 z-10" aria-label="Save">
                    <svg className="w-6 h-6 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  {/* New badge */}
                  <div className="absolute top-3 left-3 bg-white text-gray-900 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    {getPostedDate(project.createdAt)}
                  </div>
                </div>

                {/* Airbnb-style info */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{project.title}</h3>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">
                        {[project.location?.area, project.location?.city].filter(Boolean).join(', ')}
                      </p>
                      <p className="text-gray-400 text-xs capitalize">{project.type || project.propertyType}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs flex-shrink-0 pt-0.5">
                      <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <span className="font-semibold text-gray-900">New</span>
                    </div>
                  </div>
                  <div className="mt-1.5">
                    <span className="font-semibold text-sm text-gray-900">{project.price?.toLocaleString()} EGP</span>
                    <span className="text-gray-500 text-xs"> /month</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-100 mb-8">
            <div className="text-4xl mb-3">🏜️</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t('newProjects.noProperties')}</h3>
            <p className="text-slate-500">{t('newProjects.noPropertiesDesc')}</p>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/properties"
            className="group inline-flex items-center gap-3 bg-white border border-slate-200 px-7 py-3 rounded-2xl font-bold text-sm text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-md"
          >
            {t('newProjects.exploreAll')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
