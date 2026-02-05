'use client'

import { useState, useEffect } from 'react'
import { MapPin, Bed, Calendar, ArrowRight, Building2, Layers } from 'lucide-react'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

// Interfaces unchanged...
interface Property {
  _id: string; title: string; description: string; price: number | null;
  location: { city: string; area: string; address?: string };
  images: Array<{ url: string; public_id?: string } | string>;
  propertyType: string; bedrooms?: number; bathrooms?: number; type: string; createdAt: string;
}

export default function NewProjectsSection() {
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
    if (diffDays === 0) return 'Today'
    if (diffDays < 30) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 30)}m ago`
  }

  // Modern Skeleton Loader
  if (loading) {
    return (
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[2rem] h-[450px] animate-pulse border border-slate-100" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Modern Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4">
            <span className="text-primary font-bold tracking-widest uppercase text-xs">Featured Collection</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Featured <span className="text-primary">Properties</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {filteredProjects.map((project) => (
              <Link
                key={project._id}
                href={`/properties/${project._id}`}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col h-full"
              >
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
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
                  <div className="absolute bottom-5 left-5">
                    <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold shadow-xl">
                       <span className="text-sm font-light opacity-70">from</span> {project.price?.toLocaleString()} EGP
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-3">
                    <Building2 size={14} />
                    {project.propertyType || 'Residential'}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                    {project.title}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-400 mb-6">
                    <MapPin size={16} className="text-slate-300" />
                    <span className="text-sm font-medium line-clamp-1">{project.location?.area}, {project.location?.city}</span>
                  </div>

                  {/* Amenities - Clean UI */}
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-6 text-slate-600 font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-primary"><Bed size={16} /></div>
                      <span className="text-sm">{project.bedrooms || 0} Beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-primary"><Layers size={16} /></div>
                      <span className="text-sm capitalize">{project.type || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mb-16">
            <div className="text-6xl mb-6">🏜️</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No matching properties</h3>
            <p className="text-slate-500">Try changing the city or check back later.</p>
          </div>
        )}

        {/* View All Button - Footer Style */}
        <div className="text-center">
          <Link 
            href="/properties" 
            className="group inline-flex items-center gap-4 bg-white border border-slate-200 px-10 py-5 rounded-[2rem] font-black text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-xl shadow-slate-200/50"
          >
            Explore Full Collection
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}