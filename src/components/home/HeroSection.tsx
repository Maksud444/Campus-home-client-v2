'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import gsap from 'gsap'

const STATIC_AREAS = [
  'ابو يوسف (تبة)', 'باب الشرعية', 'باب الفطور', 'بركات (دراسة)', 'تبة',
  'التجمع الخامس', 'حي الثامن', 'حي العاشر', 'حي السابع', 'خان خليل',
  'دراسة', 'دوية', 'دجلة المعادي', 'رمسيس', 'زهراء', 'زهراء المعادي',
  'ميدان التحرير', 'سيدة عائشة', 'سيدة زينب', 'عتبة', 'عباسية',
  'عبدي باشا', 'عباس العقاد', 'مستشفى حسين', 'مدينة البعوث', 'منهل',
  'مكرم عبيد', 'مدينة نصر', 'مصطفى النحاس', 'مقطم', 'معادي', 'مهندسين', 'نادي غمالية', 'ميدان الغيش'
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
  const [showBudgetDropdown, setShowBudgetDropdown] = useState(false)

  // Location search: static list + Nominatim
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [nominatimResults, setNominatimResults] = useState<{ name: string; display: string }[]>([])
  const [nominatimLoading, setNominatimLoading] = useState(false)
  const nominatimTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredStatic = searchText.trim()
    ? STATIC_AREAS.filter(a => a.includes(searchText.trim()))
    : STATIC_AREAS

  const fetchNominatim = async (query: string) => {
    if (!query.trim()) { setNominatimResults([]); return }
    setNominatimLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=EG&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setNominatimResults(data.map((r: any) => ({
        name: r.name || r.display_name.split(',')[0],
        display: r.display_name,
      })))
    } catch { } finally { setNominatimLoading(false) }
  }

  const handleSearchInput = (val: string) => {
    setSearchText(val)
    setShowSuggestions(true)
    if (nominatimTimer.current) clearTimeout(nominatimTimer.current)
    nominatimTimer.current = setTimeout(() => fetchNominatim(val), 400)
  }

  const handleSelectSuggestion = (name: string) => {
    setSearchText(name)
    setSelectedArea(name)
    setShowSuggestions(false)
    setNominatimResults([])
  }

  const showDropdown = showSuggestions && (filteredStatic.length > 0 || nominatimResults.length > 0)

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
    <section className="relative md:rounded-2xl md:mx-3 md:mt-3 md:mb-3">
      {/* Background wrapper — overflow-hidden here keeps bg clipped to rounded corners
          without clipping the dropdown menus that extend beyond the form */}
      <div className="hidden md:block absolute inset-0 rounded-2xl overflow-hidden z-0 pointer-events-none">
        {/* Animated Background */}
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80)',
            transformOrigin: 'center center',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65" />
        {/* Animated Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div ref={circle1Ref} className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
          <div ref={circle2Ref} className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* ═══════════════ DESKTOP LAYOUT (md+) ═══════════════ */}
      <div className="hidden md:flex relative z-10 flex-col items-center px-8 pt-12 pb-8 min-h-[400px]">
        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
            {t('hero.title')}
          </h1>
          <p className="text-base lg:text-lg text-white font-light drop-shadow">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-4xl"
        >
          {/* Type Tabs */}
          <div className="flex gap-1.5 mb-3">
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedType(tab.value)}
                className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${
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
          <div className="flex gap-2 mb-2.5">
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-primary transition-colors">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter location or area..."
                  className="flex-1 text-gray-800 placeholder-gray-400 outline-none text-base bg-transparent"
                />
                {nominatimLoading && <svg className="animate-spin w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>}
              </div>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto z-50">
                  {filteredStatic.map((loc) => (
                    <button key={loc} type="button" onMouseDown={() => handleSelectSuggestion(loc)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0">
                      <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm text-gray-700">{loc}</span>
                    </button>
                  ))}
                  {nominatimResults.length > 0 && (
                    <>
                      <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-gray-100">Search results</div>
                      {nominatimResults.map((r, i) => (
                        <button key={`n-${i}`} type="button" onMouseDown={() => handleSelectSuggestion(r.name)}
                          className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0">
                          <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800 truncate">{r.name}</div>
                            <div className="text-xs text-gray-400 truncate">{r.display}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {t('hero.search')}
            </button>
          </div>

          {/* Filter dropdowns row */}
          <div className="flex gap-2">
            {/* Selected location display */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 truncate">
                {selectedArea || 'All Areas'}
              </div>
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

      {/* ═══════════════ MOBILE LAYOUT (< md) — Airbnb Style ═══════════════ */}
      <div className="md:hidden bg-white px-4 pt-3 pb-4">
        <form onSubmit={handleSearch} className="relative">

          {/* Airbnb-style pill search bar */}
          <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-[0_2px_12px_rgba(0,0,0,0.1)] px-5 py-3.5 gap-3">
            <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={searchText}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Where to?"
                className="w-full text-sm font-semibold text-gray-900 placeholder-gray-500 outline-none bg-transparent leading-tight"
              />
              <div className="text-xs text-gray-400 mt-0.5">
                {selectedType ? selectedType.charAt(0).toUpperCase() + selectedType.slice(1) : 'Any type'} · {selectedBudget || 'Any budget'}
              </div>
            </div>
            {nominatimLoading && (
              <svg className="animate-spin w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            <button
              type="submit"
              className="w-9 h-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 transition-transform"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
              {filteredStatic.map((loc) => (
                <button key={loc} type="button" onMouseDown={() => handleSelectSuggestion(loc)}
                  className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0">
                  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{loc}</span>
                </button>
              ))}
              {nominatimResults.length > 0 && (
                <>
                  <div className="px-5 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-gray-100">Search results</div>
                  {nominatimResults.map((r, i) => (
                    <button key={`n-${i}`} type="button" onMouseDown={() => handleSelectSuggestion(r.name)}
                      className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0">
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{r.name}</div>
                        <div className="text-xs text-gray-400 truncate">{r.display}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Type filter chips + Budget chip — horizontal scroll */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {typeTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedType(tab.value)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedType === tab.value
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Budget chip */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowBudgetDropdown(!showBudgetDropdown)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedBudget ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedBudget || 'Budget'}
              </button>
              {showBudgetDropdown && (
                <div className="absolute left-0 top-full mt-2 z-50 w-52 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
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

          {/* Selected location chip */}
          {selectedArea && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full max-w-full">
                <svg className="w-3.5 h-3.5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-semibold text-primary truncate">{selectedArea}</span>
                <button type="button" onClick={() => { setSelectedArea(''); setSearchText('') }} className="text-primary/60 hover:text-primary ml-1 flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
