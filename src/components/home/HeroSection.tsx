'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import gsap from 'gsap'

export default function HeroSection() {
  const router = useRouter()
  const { t } = useLanguage()
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('')
  const [searchData, setSearchData] = useState({
    location: '',
    propertyType: '',
    priceRange: ''
  })

  const bgRef = useRef<HTMLDivElement>(null)
  const circle1Ref = useRef<HTMLDivElement>(null)
  const circle2Ref = useRef<HTMLDivElement>(null)

  // Egyptian cities/locations
  const locations = [
    'Cairo', 'Giza', 'Alexandria', 'Nasr City', 'New Cairo',
    'Maadi', 'Heliopolis', 'Zamalek', '6th October', 'Sheikh Zayed'
  ]

  // Property types for dropdown
  const propertyTypes = [
    'Apartment', 'Room', 'Roommate', 'Studio', 'Villa', 'Duplex', 'Penthouse'
  ]

  // Property type quick filters (as requested by user)
  const quickFilters = [
    { value: 'apartment', label: t('hero.apartment') },
    { value: 'room', label: t('hero.room') },
    { value: 'roommate', label: t('hero.roommate') },
  ]

  // Price ranges
  const priceRanges = [
    'Any Price', '0 - 2,000 EGP', '2,000 - 5,000 EGP',
    '5,000 - 10,000 EGP', '10,000+ EGP'
  ]

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background animation
      gsap.to(bgRef.current, {
        scale: 1.1,
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

    const propertyType = selectedPropertyType || searchData.propertyType

    if (searchData.location) params.append('location', searchData.location)
    if (propertyType) params.append('type', propertyType.toLowerCase())
    if (searchData.priceRange) params.append('priceRange', searchData.priceRange)

    // Navigate to properties page with filters
    router.push(`/properties?${params.toString()}`)
  }

  const handleQuickFilter = (type: string) => {
    setSelectedPropertyType(type)
    setSearchData({ ...searchData, propertyType: type })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
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
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

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
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-tight px-4">
          {t('hero.title')}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 font-light px-4">
          {t('hero.subtitle')}
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden mx-4 sm:mx-0">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Location Dropdown */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 text-left">
                  {t('hero.location')}
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <select
                    value={searchData.location}
                    onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                    className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer bg-white font-medium text-gray-700"
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 text-left">
                  {t('hero.propertyType')}
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <select
                    value={selectedPropertyType || searchData.propertyType}
                    onChange={(e) => {
                      setSearchData({ ...searchData, propertyType: e.target.value })
                      setSelectedPropertyType(e.target.value)
                    }}
                    className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer bg-white font-medium text-gray-700"
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type.toLowerCase()}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Price Range Dropdown */}
              <div className="w-full">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 text-left">
                  {t('hero.priceRange')}
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <select
                    value={searchData.priceRange}
                    onChange={(e) => setSearchData({ ...searchData, priceRange: e.target.value })}
                    className="w-full pl-10 sm:pl-12 pr-8 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer bg-white font-medium text-gray-700"
                  >
                    {priceRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Search Button */}
              <div className="w-full flex items-end">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base lg:text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {t('hero.search')}
                </button>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => handleQuickFilter(filter.value)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-full transition-all ${
                    selectedPropertyType === filter.value
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-12 sm:mt-16 max-w-5xl mx-auto px-4">
          {[
            { value: '5,234+', label: t('stats.properties'), icon: '🏠' },
            { value: '10,450+', label: t('stats.students'), icon: '🎓' },
            { value: '602+', label: t('stats.agents'), icon: '👔' },
            { value: '98%', label: t('stats.satisfied'), icon: '⭐' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-white/50 hover:bg-white hover:scale-105 transition-all group cursor-pointer shadow-xl"
            >
              <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
