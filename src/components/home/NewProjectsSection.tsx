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
  ]

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_URL}/api/properties?limit=12`)
        const data = await response.json()
        if (data.success && data.properties) setProjects(data.properties)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const filteredProjects = projects.filter(p => p.location?.city === activeCity).slice(0, 6)

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
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div className="space-y-1.5">
            <span className="text-primary font-bold tracking-widest uppercase text-xs">{t('newProjects.badge')}</span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
              {t('newProjects.title')} <span className="text-primary">{t('newProjects.titleHighlight')}</span>
            </h2>
          </div>

          {/* City Tabs - Pill Style */}
          <div className="flex p-1.5 bg-white shadow-sm border border-slate-100 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
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

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            {filteredProjects.map((project) => (
              <Link
                key={project._id}
                href={`/properties/${project._id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImageUrl(project.images)}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Floating Badges */}
                  <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      {getPostedDate(project.createdAt)}
                    </span>
                    <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-bold shadow-xl text-sm">
                       <span className="text-sm font-light opacity-70">{t('newProjects.from')}</span> {project.price?.toLocaleString()} EGP
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-widest mb-1.5">
                    <Building2 size={12} />
                    {project.propertyType || t('newProjects.residential')}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                    {project.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-slate-400 mb-3">
                    <MapPin size={13} className="text-slate-300" />
                    <span className="text-xs font-medium line-clamp-1">{project.location?.area}, {project.location?.city}</span>
                  </div>

                  {/* Amenities */}
                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center gap-4 text-slate-600 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-primary"><Bed size={13} /></div>
                      <span className="text-xs">{project.bedrooms || 0} {t('newProjects.beds')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-primary"><Layers size={13} /></div>
                      <span className="text-xs capitalize">{project.type || 'N/A'}</span>
                    </div>
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
