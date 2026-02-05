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

  // Egyptian cities
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

  // Property types
  const propertyTypes = [
    { value: '', label: 'All Property Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'studio', label: 'Studio' },
    { value: 'villa', label: 'Villa' },
    { value: 'room', label: 'Room / Shared' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'penthouse', label: 'Penthouse' },
  ]

  // Bedrooms options
  const bedroomsOptions = [
    { value: '', label: 'Any Bedrooms' },
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedrooms' },
    { value: '3', label: '3 Bedrooms' },
    { value: '4', label: '4+ Bedrooms' },
  ]

  // Bathrooms options
  const bathroomsOptions = [
    { value: '', label: 'Any Bathrooms' },
    { value: '1', label: '1 Bathroom' },
    { value: '2', label: '2 Bathrooms' },
    { value: '3', label: '3+ Bathrooms' },
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background animation
      gsap.to(bgRef.current, {
        scale: 1.05,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Floating circles
      gsap.to(circle1Ref.current, {
        y: -50,
        x: 30,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      gsap.to(circle2Ref.current, {
        y: 40,
        x: -40,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    })

    return () => ctx.revert()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build query string
    const params = new URLSearchParams()
    
    if (searchData.city) params.append('location', searchData.city)
    if (searchData.propertyType) params.append('type', searchData.propertyType)
    if (searchData.bedrooms) params.append('bedrooms', searchData.bedrooms)
    if (searchData.bathrooms) params.append('bathrooms', searchData.bathrooms)
    params.append('tab', activeTab)
    
    // Navigate to properties page with filters
    router.push(`/properties?${params.toString()}`)
  }

  const tabs = [
    { id: 'rent', label: 'Rent', icon: '🏠' },
    { id: 'buy', label: 'Buy', icon: '💰' },
    { id: 'commercial', label: 'Commercial', icon: '🏢' },
    { id: 'roommate', label: 'Roommate', icon: '👥' },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated Background */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80)',
          transformOrigin: 'center center'
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

      {/* Animated Circles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          ref={circle1Ref}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <div 
          ref={circle2Ref}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight">
          Your home search starts here
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-12 font-light">
          Find properties to rent, buy or invest
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold text-base transition-all relative ${
                  activeTab === tab.id
                    ? 'text-primary bg-gray-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* City Dropdown */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  City
                </label>
                <div className="relative">
                  <svg 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    value={searchData.city}
                    onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer bg-white font-medium text-gray-700"
                  >
                    {cities.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Property type
                </label>
                <div className="relative">
                  <svg 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <select
                    value={searchData.propertyType}
                    onChange={(e) => setSearchData({ ...searchData, propertyType: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer bg-white font-medium text-gray-700"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Bedrooms Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Bedrooms
                </label>
                <div className="relative">
                  <svg 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <select
                    value={searchData.bedrooms}
                    onChange={(e) => setSearchData({ ...searchData, bedrooms: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer bg-white font-medium text-gray-700"
                  >
                    {bedroomsOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Bathrooms Dropdown */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 text-left">
                  Bathrooms
                </label>
                <div className="relative">
                  <svg 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  <select
                    value={searchData.bathrooms}
                    onChange={(e) => setSearchData({ ...searchData, bathrooms: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer bg-white font-medium text-gray-700"
                  >
                    {bathroomsOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2 flex items-end">
                <button
                  type="submit"
                 className="w-full bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            { value: '5,234', label: 'Properties', icon: '🏘️' },
            { value: '10,450', label: 'Happy Students', icon: '🎓' },
            { value: '562', label: 'Service Providers', icon: '🔧' },
            { value: '98%', label: 'Satisfaction', icon: '⭐' },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border-2 border-white/50 hover:bg-white hover:scale-105 transition-all group cursor-pointer shadow-xl"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-extrabold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}