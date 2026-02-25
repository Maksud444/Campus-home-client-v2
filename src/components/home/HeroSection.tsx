'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import gsap from 'gsap'

const locations = [
  'ابو يوسف (تبة)', 'باب الشرعية', 'باب الفطور', 'بركات (دراسة)', 'تبة',
  'التجمع الخامس', 'حي الثامن', 'حي العاشر', 'حي السابع', 'خان خليل',
  'دراسة', 'دوية', 'دجلة المعادي', 'رمسيس', 'زهراء', 'زهراء المعادي',
  'ميدان التحرير', 'سيدة عائشة', 'سيدة زينب', 'عتبة', 'عباسية',
  'عبدي باشا', 'عباس العقاد', 'مستشفى حسين', 'مدينة البعوث', 'منهل',
  'مكرم عبيد', 'مدينة نصر', 'مصطفى النحاس', 'مقطم', 'معادي', 'مهندسين', 'نادي غمالية'
]

const propertyTypes = ['Property', 'Room', 'Roommate']

const priceRanges = [
  'Any Budget', '0 - 2,000 EGP', '2,000 - 5,000 EGP',
  '5,000 - 10,000 EGP', '10,000+ EGP'
]

const typeTabs = [
  { value: '', label: 'All' },
  { value: 'property', label: 'Property' },
  { value: 'room', label: 'Room' },
  { value: 'roommate', label: 'Roommate' },
]

export default function HeroSection() {
  const router = useRouter()
  const { t } = useLanguage()

  const [searchText, setSearchText] = useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedBudget, setSelectedBudget] = useState('')

  // Mobile-only dropdown state
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false)

  const bgRef = useRef<HTMLDivElement>(null)
  const circle1Ref = useRef<HTMLDivElement>(null)
  const circle2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(bgRef.current, {
        scale: 1.08,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to(circle1Ref.current, {
        y: -40,
        x: 25,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      gsap.to(circle2Ref.current, {
        y: 35,
        x: -35,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })
    return () => ctx.revert()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    const location = selectedArea || searchText
    if (location) params.append('location', location)
    if (selectedType) params.append('type', selectedType.toLowerCase())
    if (selectedBudget && selectedBudget !== 'Any Budget') params.append('priceRange', selectedBudget)
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80)',
          transformOrigin: 'center center',
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65" />

      {/* Animated Circles */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div ref={circle1Ref} className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div ref={circle2Ref} className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
      </div>

      {/* ═══════════════ DESKTOP LAYOUT (md+) ═══════════════ */}
      <div className="hidden md:flex relative z-10 flex-col items-center justify-center min-h-screen px-8 py-24">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
            {t('hero.title')}
          </h1>
          <p className="text-xl lg:text-2xl text-white font-light drop-shadow">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-4xl"
        >
          {/* Type Tabs */}
          <div className="flex gap-2 mb-5">
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedType(tab.value)}
                className={`px-5 py-2 rounded-xl font-semibold text-sm transition-all ${
                  selectedType === tab.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search input + button row */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Enter location or area..."
                className="flex-1 text-gray-800 placeholder-gray-400 outline-none text-base bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold text-base transition-all hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('hero.search')}
            </button>
          </div>

          {/* Filter dropdowns row */}
          <div className="flex gap-3">
            {/* All Areas */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary appearance-none cursor-pointer bg-white text-sm font-medium text-gray-700 transition-colors"
              >
                <option value="">All Areas</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Property Type */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary appearance-none cursor-pointer bg-white text-sm font-medium text-gray-700 transition-colors"
              >
                <option value="">Property Type</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>{type}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Price Range */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary appearance-none cursor-pointer bg-white text-sm font-medium text-gray-700 transition-colors"
              >
                {priceRanges.map((range) => (
                  <option key={range} value={range === 'Any Budget' ? '' : range}>{range}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </form>
      </div>

      {/* ═══════════════ MOBILE LAYOUT (< md) ═══════════════ */}
      <div className="md:hidden flex flex-col justify-between min-h-screen">
        {/* Title at top */}
        <div className="relative z-10 pt-28 pb-8 px-6 text-center">
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-3 drop-shadow-lg">
            {t('hero.title')}
          </h1>
          <p className="text-base text-white font-light drop-shadow">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Search Card at bottom */}
        <div className="relative z-10 px-4 pb-10">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-3xl shadow-2xl overflow-visible"
          >
            {/* Row 1: Search text input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by area..."
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
              <button
                type="button"
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm3 5a1 1 0 011-1h10a1 1 0 010 2H7a1 1 0 01-1-1zm4 5a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" />
                </svg>
              </button>
            </div>

            {/* Row 2: All Areas dropdown */}
            <div className="relative border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowAreaDropdown(!showAreaDropdown)
                  setShowTypeDropdown(false)
                  setShowBudgetDropdown(false)
                }}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">
                    {selectedArea || 'All Areas'}
                  </span>
                </div>
                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showAreaDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showAreaDropdown && (
                <div className="absolute left-0 right-0 top-full z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-52 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { setSelectedArea(''); setShowAreaDropdown(false) }}
                    className="w-full text-left px-5 py-3 text-sm text-gray-800 hover:bg-gray-50 font-semibold border-b border-gray-100"
                  >
                    All Areas
                  </button>
                  {locations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => { setSelectedArea(loc); setShowAreaDropdown(false) }}
                      className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Row 3: Property Type + Any Budget */}
            <div className="grid grid-cols-2 border-b border-gray-100">
              {/* Property Type */}
              <div className="relative border-r border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowTypeDropdown(!showTypeDropdown)
                    setShowAreaDropdown(false)
                    setShowBudgetDropdown(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-4"
                >
                  <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800 truncate">
                    {selectedType
                      ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
                      : 'Property Type'}
                  </span>
                </button>
                {showTypeDropdown && (
                  <div className="absolute left-0 top-full z-50 w-44 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setSelectedType(''); setShowTypeDropdown(false) }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 font-semibold border-b border-gray-100"
                    >
                      All Types
                    </button>
                    {propertyTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setSelectedType(type.toLowerCase()); setShowTypeDropdown(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Any Budget */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowBudgetDropdown(!showBudgetDropdown)
                    setShowAreaDropdown(false)
                    setShowTypeDropdown(false)
                  }}
                  className="w-full flex items-center justify-between px-4 py-4"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-5 h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {selectedBudget || 'Any Budget'}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${showBudgetDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showBudgetDropdown && (
                  <div className="absolute right-0 top-full z-50 w-52 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => { setSelectedBudget(''); setShowBudgetDropdown(false) }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-gray-50 font-semibold border-b border-gray-100"
                    >
                      Any Budget
                    </button>
                    {priceRanges.slice(1).map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => { setSelectedBudget(range); setShowBudgetDropdown(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Search Button */}
            <div className="px-4 py-4">
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold text-base transition-all hover:shadow-lg"
              >
                {t('hero.search')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
