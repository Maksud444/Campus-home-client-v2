'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

export default function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('rent')
  const [searchData, setSearchData] = useState({
    city: 'cairo',
    propertyType: '',
    bedrooms: '',
    bathrooms: ''
  })

  const bgRef = useRef<HTMLDivElement>(null)
  const circle1Ref = useRef<HTMLDivElement>(null)
  const circle2Ref = useRef<HTMLDivElement>(null)

  // লজিক এবং ডেটা আগের মতোই আছে...
  const cities = [
    { value: 'cairo', label: 'Cairo' },
    { value: 'giza', label: 'Giza' },
    { value: 'alexandria', label: 'Alexandria' },
    { value: 'nasr-city', label: 'Nasr City' },
    { value: 'new-cairo', label: 'New Cairo' },
    { value: 'maadi', label: 'Maadi' },
    { value: 'heliopolis', label: 'Heliopolis' },
    { value: 'zamalek', label: 'Zamalek' },
    { value: '6th-october', label: '6th of October' },
    { value: 'sheikh-zayed', label: 'Sheikh Zayed' },
  ]

  const propertyTypes = [
    { value: '', label: 'All Property Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'studio', label: 'Studio' },
    { value: 'villa', label: 'Villa' },
    { value: 'room', label: 'Room / Shared' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'penthouse', label: 'Penthouse' },
  ]

  const bedroomsOptions = [
    { value: '', label: 'Any Bedrooms' },
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4+ Bedrooms' },
  ]

  const bathroomsOptions = [
    { value: '', label: 'Any Bathrooms' },
    { value: '1', label: '1 Bathroom' },
    { value: '2', label: '2 Bathrooms' },
    { value: '3', label: '3+ Bathrooms' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, { scale: 1.1, duration: 25, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(circle1Ref.current, { y: -50, x: 30, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(circle2Ref.current, { y: 40, x: -40, duration: 10, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    })
    return () => ctx.revert()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchData.city) params.append('location', searchData.city)
    if (searchData.propertyType) params.append('type', searchData.propertyType)
    if (searchData.bedrooms) params.append('bedrooms', searchData.bedrooms)
    if (searchData.bathrooms) params.append('bathrooms', searchData.bathrooms)
    params.append('tab', activeTab)
    router.push(`/properties?${params.toString()}`)
  }

  const tabs = [
    { id: 'rent', label: 'Rent', icon: '🏠' },
    { id: 'buy', label: 'Buy', icon: '💰' },
    { id: 'commercial', label: 'Commercial', icon: '🏢' },
    { id: 'roommate', label: 'Roommate', icon: '👥' },
  ]

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-32 pb-20 overflow-hidden bg-slate-900">
      {/* Background Image with Overlay */}
      <div ref={bgRef} className="absolute inset-0 z-0 bg-cover bg-center opacity-60 transition-transform duration-1000"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80)' }} 
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {/* Title Section */}
        <div className="mb-10 space-y-4">
          <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl">
            Find Your Dream <span className="text-primary italic">Home</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light">
            Explore the best student accommodations and investment properties across Egypt.
          </p>
        </div>

        {/* Search Box - Glassmorphism Style */}
        <div className="bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden">
          <div className="flex p-2 gap-2 bg-black/20 rounded-[1.5rem] w-fit mx-auto mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 md:p-6 bg-white rounded-3xl">
            <div className="space-y-1.5 text-left px-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Location</label>
              <select
                value={searchData.city}
                onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
                className="w-full bg-transparent text-gray-800 font-semibold text-lg focus:outline-none cursor-pointer border-b-2 border-gray-100 focus:border-primary transition-colors pb-1"
              >
                {cities.map((city) => <option key={city.value} value={city.value}>{city.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5 text-left px-2 border-l-0 md:border-l border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Property Type</label>
              <select
                value={searchData.propertyType}
                onChange={(e) => setSearchData({ ...searchData, propertyType: e.target.value })}
                className="w-full bg-transparent text-gray-800 font-semibold text-lg focus:outline-none cursor-pointer border-b-2 border-gray-100 focus:border-primary transition-colors pb-1"
              >
                {propertyTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>

            <div className="space-y-1.5 text-left px-2 border-l-0 md:border-l border-gray-100">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Configuration</label>
              <select
                value={`${searchData.bedrooms}-${searchData.bathrooms}`}
                onChange={(e) => {
                  const [beds, baths] = e.target.value.split('-')
                  setSearchData({ ...searchData, bedrooms: beds, bathrooms: baths })
                }}
                className="w-full bg-transparent text-gray-800 font-semibold text-lg focus:outline-none cursor-pointer border-b-2 border-gray-100 focus:border-primary transition-colors pb-1"
              >
                <option value="-">Select Rooms</option>
                <option value="1-1">1 Bed, 1 Bath</option>
                <option value="2-2">2 Bed, 2 Bath</option>
                <option value="3-2">3 Bed, 2 Bath</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-primary/20 group">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </form>
        </div>

        {/* Updated Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { value: '5,234+', label: 'Total Properties', color: 'bg-teal-500' },
            { value: '10k+', label: 'Student Rooms', color: 'bg-orange-500' },
            { value: '560+', label: 'Trusted Hosts', color: 'bg-blue-500' },
            { value: '98%', label: 'Positive Reviews', color: 'bg-yellow-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10 transition-colors">
              <div className={`w-1 h-8 ${stat.color} rounded-full mb-3`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}