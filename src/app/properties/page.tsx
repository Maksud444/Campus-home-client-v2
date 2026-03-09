'use client'

import { useState, useEffect, Suspense, useRef, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Property {
  _id: string
  title: string
  description: string
  type: string
  price: number
  location: {
    city: string
    area: string
    address: string
  }
  propertyType: string
  bedrooms: number
  bathrooms: number
  area: number
  images: Array<{ url: string }>
  videos?: string[]
  amenities: string[]
  whatsapp: {
    countryCode: string
    number: string
  }
  status: string
  isDeleted: boolean
  deletedAt?: string
  permanentDeleteAt?: string
  userId: {
    _id: string
    name: string
    email: string
    avatar: string
  }
  views: number
  likes: string[]
  createdAt: string
}

function PropertiesPageContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPriceDropdown, setShowPriceDropdown] = useState(false)
  const priceDropdownRef = useRef<HTMLDivElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [filters, setFilters] = useState({
    city: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: ''
  })

  // Close price dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target as Node)) {
        setShowPriceDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Read URL parameters and set initial filters
  useEffect(() => {
    const location = searchParams.get('location')
    const type = searchParams.get('type')
    const priceRange = searchParams.get('priceRange')

    let minPrice = ''
    let maxPrice = ''
    if (priceRange && priceRange !== 'Any Price') {
      if (priceRange.includes('+')) {
        minPrice = priceRange.replace(/[^\d]/g, '')
        maxPrice = ''
      } else if (priceRange.includes('-')) {
        const parts = priceRange.split('-').map(p => p.replace(/[^\d]/g, '').trim())
        minPrice = parts[0] || ''
        maxPrice = parts[1] || ''
      }
    }

    if (location || type || priceRange) {
      setFilters(prev => ({
        ...prev,
        city: location || '',
        type: type || '',
        minPrice: minPrice,
        maxPrice: maxPrice
      }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError('')

      const [extRes, localRes] = await Promise.all([
        fetch(`${API_URL}/api/properties`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        }).catch(() => null),
        fetch('/api/posts', { cache: 'no-store' }).catch(() => null),
      ])

      let allProperties: Property[] = []

      if (extRes?.ok) {
        const data = await extRes.json()
        if (data.success && data.properties) allProperties = data.properties
      }

      if (localRes?.ok) {
        const localData = await localRes.json()
        if (localData.success && localData.posts?.length) {
          const extIds = new Set(allProperties.map(p => p._id))
          const localProps: Property[] = localData.posts
            .filter((p: any) => !p.backendId || !extIds.has(p.backendId))
            .map((p: any) => normalizeLocalPost(p))
          allProperties = [...allProperties, ...localProps]
        }
      }

      allProperties.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      )

      if (allProperties.length > 0) {
        setProperties(allProperties)
      } else if (!extRes?.ok) {
        throw new Error('Failed to load properties')
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  function normalizeLocalPost(p: any): Property {
    const imgs = (p.images || [])
      .map((img: any) => typeof img === 'string' ? { url: img } : img?.url ? { url: img.url } : null)
      .filter(Boolean)
    const loc = typeof p.location === 'string'
      ? { city: p.location, area: '', address: '' }
      : { city: p.location?.city || '', area: p.location?.area || '', address: p.location?.address || '' }
    return {
      _id: p.id || p._id,
      title: p.title || '',
      description: p.description || '',
      type: p.type || 'apartment',
      price: p.price || 0,
      location: loc,
      propertyType: p.propertyType || '',
      bedrooms: p.bedrooms || 0,
      bathrooms: p.bathrooms || 0,
      area: p.area || 0,
      images: imgs,
      videos: (p.videos || []).map((v: any) => typeof v === 'string' ? v : v?.url || '').filter(Boolean),
      amenities: p.amenities || [],
      whatsapp: p.whatsapp || { countryCode: '', number: '' },
      status: 'active',
      isDeleted: false,
      userId: { _id: '', name: p.userName || '', email: p.userEmail || '', avatar: p.userImage || '' },
      views: p.views || 0,
      likes: p.likes || [],
      createdAt: p.createdAt,
    } as Property
  }

  const filteredProperties = properties.filter(property => {
    // Only show active/approved properties (hide pending & rejected)
    const s = (property.status || 'active').toLowerCase()
    if (s !== 'active' && s !== 'approved') return false

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const title = property.title?.toLowerCase() || ''
      const desc = property.description?.toLowerCase() || ''
      const area = property.location?.area?.toLowerCase() || ''
      if (!title.includes(q) && !desc.includes(q) && !area.includes(q)) return false
    }

    if (filters.city) {
      const filterVal = filters.city.toLowerCase()
      const city = property.location?.city?.toLowerCase() || ''
      const area = property.location?.area?.toLowerCase() || ''
      if (!city.includes(filterVal) && !area.includes(filterVal)) return false
    }

    if (filters.type && property.type?.toLowerCase() !== filters.type.toLowerCase()) return false

    if (filters.minPrice && property.price !== null && property.price !== undefined) {
      if (property.price < parseInt(filters.minPrice)) return false
    }
    if (filters.maxPrice && property.price !== null && property.price !== undefined) {
      if (property.price > parseInt(filters.maxPrice)) return false
    }

    if (filters.bedrooms) {
      const bedroomFilter = parseInt(filters.bedrooms)
      if (filters.bedrooms === '4') {
        if (!property.bedrooms || property.bedrooms < 4) return false
      } else {
        if (property.bedrooms !== bedroomFilter) return false
      }
    }

    return true
  })

  const getPriceLabel = () => {
    if (filters.minPrice && filters.maxPrice) {
      return `${parseInt(filters.minPrice).toLocaleString()} - ${parseInt(filters.maxPrice).toLocaleString()} EGP`
    }
    if (filters.minPrice) {
      return `${parseInt(filters.minPrice).toLocaleString()}+ EGP`
    }
    if (filters.maxPrice) {
      return `0 - ${parseInt(filters.maxPrice).toLocaleString()} EGP`
    }
    return t('propertiesPage.price')
  }

  const hasActiveFilters = searchQuery || filters.city || filters.type || filters.minPrice || filters.maxPrice || filters.bedrooms

  // Reset to page 1 whenever filters or search change
  useEffect(() => { setCurrentPage(1) }, [searchQuery, filters.city, filters.type, filters.minPrice, filters.maxPrice, filters.bedrooms])

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  const paginatedProperties = filteredProperties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Compute per-area property counts (from all properties, not filtered)
  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    properties.forEach(p => {
      const area = p.location?.area || p.location?.city || ''
      if (area) counts[area] = (counts[area] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [properties])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('propertiesPage.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-3 md:pt-6">

      {/* ── Sticky filter bar + area chips ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 md:top-[68px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3">

          {/* ── MOBILE layout: 2 rows ── */}
          <div className="md:hidden">
            {/* Row 1: Search + Map */}
            <div className="flex items-center gap-2 pt-2.5 pb-2">
              <div className="relative flex-1 min-w-0">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('propertiesPage.search')}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <Link
                href="/properties/map"
                className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Map
              </Link>
            </div>
            {/* Row 2: Scrollable filter chips */}
            <div className="flex gap-2 overflow-x-auto pt-2 pb-4" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className={`flex-shrink-0 border rounded-full px-3 py-1.5 text-xs focus:outline-none bg-white font-medium ${filters.city ? 'border-primary text-primary' : 'border-gray-200 text-gray-700'}`}
              >
                <option value="">{t('propertiesPage.allAreas')}</option>
                <option value="Cairo">{t('propertiesPage.cairoAll')}</option>
                {['ابو يوسف (تبة)', 'باب الشرعية', 'باب الفطور', 'بركات (دراسة)', 'تبة',
                  'التجمع الخامس', 'حي الثامن', 'حي العاشر', 'حي السابع', 'خان خليل',
                  'دراسة', 'دوية', 'دجلة المعادي', 'رمسيس', 'زهراء', 'زهراء المعادي',
                  'ميدان التحرير', 'سيدة عائشة', 'سيدة زينب', 'عتبة', 'عباسية',
                  'عبدي باشا', 'عباس العقاد', 'مستشفى حسين', 'مدينة البعوث', 'منهل',
                  'مكرم عبيد', 'مدينة نصر', 'مصطفى النحاس', 'مقطم', 'معادي', 'مهندسين', 'نادي غمالية'
                ].map(area => <option key={area} value={area}>{area}</option>)}
              </select>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className={`flex-shrink-0 border rounded-full px-3 py-1.5 text-xs focus:outline-none bg-white font-medium ${filters.type ? 'border-primary text-primary' : 'border-gray-200 text-gray-700'}`}
              >
                <option value="">{t('propertiesPage.allTypes')}</option>
                <option value="property">{t('propertiesPage.propertyType')}</option>
                <option value="room">{t('propertiesPage.roomType')}</option>
                <option value="roommate">{t('propertiesPage.roommateType')}</option>
              </select>
              <select
                value={filters.minPrice && filters.maxPrice ? `${filters.minPrice}-${filters.maxPrice}` : filters.minPrice ? `${filters.minPrice}-` : ''}
                onChange={(e) => {
                  const v = e.target.value
                  if (!v) setFilters({ ...filters, minPrice: '', maxPrice: '' })
                  else if (v === '0-2000') setFilters({ ...filters, minPrice: '0', maxPrice: '2000' })
                  else if (v === '2000-5000') setFilters({ ...filters, minPrice: '2000', maxPrice: '5000' })
                  else if (v === '5000-10000') setFilters({ ...filters, minPrice: '5000', maxPrice: '10000' })
                  else if (v === '10000-') setFilters({ ...filters, minPrice: '10000', maxPrice: '' })
                }}
                className={`flex-shrink-0 border rounded-full px-3 py-1.5 text-xs focus:outline-none bg-white font-medium ${(filters.minPrice || filters.maxPrice) ? 'border-primary text-primary' : 'border-gray-200 text-gray-700'}`}
              >
                <option value="">{t('propertiesPage.price')}</option>
                <option value="0-2000">0 – 2,000 EGP</option>
                <option value="2000-5000">2,000 – 5,000 EGP</option>
                <option value="5000-10000">5,000 – 10,000 EGP</option>
                <option value="10000-">10,000+ EGP</option>
              </select>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className={`flex-shrink-0 border rounded-full px-3 py-1.5 text-xs focus:outline-none bg-white font-medium ${filters.bedrooms ? 'border-primary text-primary' : 'border-gray-200 text-gray-700'}`}
              >
                <option value="">{t('properties.bedrooms')}</option>
                <option value="1">1 {t('propertiesPage.br')}</option>
                <option value="2">2 {t('propertiesPage.br')}</option>
                <option value="3">3 {t('propertiesPage.br')}</option>
                <option value="4">4+ {t('propertiesPage.br')}</option>
              </select>
              {hasActiveFilters && (
                <button
                  onClick={() => { setFilters({ city: '', type: '', minPrice: '', maxPrice: '', bedrooms: '' }); setSearchQuery('') }}
                  className="flex-shrink-0 text-xs text-red-500 border border-red-200 rounded-full px-3 py-1.5 whitespace-nowrap flex items-center gap-1 bg-red-50 font-medium"
                >
                  ✕ {t('propertiesPage.clearFilters')}
                </button>
              )}
            </div>
          </div>

          {/* ── DESKTOP layout: single row ── */}
          <div className="hidden md:flex items-center gap-2 py-2.5">
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('propertiesPage.search')}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="w-px h-7 bg-gray-200 flex-shrink-0" />
            {/* Location */}
            <select
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              className="flex-shrink-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white text-gray-700"
            >
              <option value="">{t('propertiesPage.allAreas')}</option>
              <option value="Cairo">{t('propertiesPage.cairoAll')}</option>
              {['ابو يوسف (تبة)', 'باب الشرعية', 'باب الفطور', 'بركات (دراسة)', 'تبة',
                'التجمع الخامس', 'حي الثامن', 'حي العاشر', 'حي السابع', 'خان خليل',
                'دراسة', 'دوية', 'دجلة المعادي', 'رمسيس', 'زهراء', 'زهراء المعادي',
                'ميدان التحرير', 'سيدة عائشة', 'سيدة زينب', 'عتبة', 'عباسية',
                'عبدي باشا', 'عباس العقاد', 'مستشفى حسين', 'مدينة البعوث', 'منهل',
                'مكرم عبيد', 'مدينة نصر', 'مصطفى النحاس', 'مقطم', 'معادي', 'مهندسين', 'نادي غمالية'
              ].map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            {/* Type */}
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="flex-shrink-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white text-gray-700"
            >
              <option value="">{t('propertiesPage.allTypes')}</option>
              <option value="property">{t('propertiesPage.propertyType')}</option>
              <option value="room">{t('propertiesPage.roomType')}</option>
              <option value="roommate">{t('propertiesPage.roommateType')}</option>
            </select>
            {/* Price dropdown */}
            <div ref={priceDropdownRef} className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm focus:outline-none bg-white whitespace-nowrap ${
                  (filters.minPrice || filters.maxPrice)
                    ? 'border-primary text-primary font-semibold'
                    : 'border-gray-200 text-gray-700'
                }`}
              >
                <span>{getPriceLabel()}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPriceDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-40 p-4 w-64">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t('propertiesPage.minPrice')}</label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-end pb-2 text-gray-400 font-medium">—</div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1">{t('propertiesPage.maxPrice')}</label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                        placeholder="50,000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => { setFilters({ ...filters, minPrice: '', maxPrice: '' }); setShowPriceDropdown(false) }}
                      className="flex-1 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      {t('propertiesPage.reset')}
                    </button>
                    <button
                      onClick={() => setShowPriceDropdown(false)}
                      className="flex-1 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                    >
                      {t('propertiesPage.apply')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Bedrooms */}
            <select
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
              className="flex-shrink-0 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white text-gray-700"
            >
              <option value="">{t('properties.bedrooms')}</option>
              <option value="1">1 {t('propertiesPage.br')}</option>
              <option value="2">2 {t('propertiesPage.br')}</option>
              <option value="3">3 {t('propertiesPage.br')}</option>
              <option value="4">4+ {t('propertiesPage.br')}</option>
            </select>
            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => { setFilters({ city: '', type: '', minPrice: '', maxPrice: '', bedrooms: '' }); setSearchQuery('') }}
                className="flex-shrink-0 text-sm text-gray-500 hover:text-red-500 transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {t('propertiesPage.clearFilters')}
              </button>
            )}
            {/* Map view button */}
            <Link
              href="/properties/map"
              className="flex-shrink-0 flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap hover:bg-primary-dark transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </Link>
          </div>

          {/* ── Area chips row (horizontal scroll) – inside sticky bar ── */}
          {areaCounts.length > 0 && (
            <div className="pt-4 pb-5">
              <div className="flex gap-2 overflow-x-auto pb-2" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
                {/* "All" chip */}
                <button
                  onClick={() => setFilters({ ...filters, city: '' })}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    !filters.city
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({properties.length})
                </button>
                {areaCounts.map(([area, count]) => (
                  <button
                    key={area}
                    onClick={() => setFilters({ ...filters, city: filters.city === area ? '' : area })}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      filters.city === area
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {area} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-5">

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-bold text-primary">{filteredProperties.length}</span> {t('stats.properties').toLowerCase()} {t('propertiesPage.found')}
          {totalPages > 1 && <span className="text-gray-400 ml-2">({(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProperties.length)})</span>}
        </p>

        {/* Empty state */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('propertiesPage.noProperties')}</h3>
            <p className="text-gray-600 mb-6">{t('propertiesPage.adjustFilters')}</p>
            <Link href="/post" className="btn btn-primary">
              {t('propertiesPage.addProperty')}
            </Link>
          </div>
        ) : (

          /* ── Bayut-style property cards ── */
          <div className="flex flex-col gap-4">
            {paginatedProperties.map((property) => {
              const isOwner = session?.user?.email === property.userId?.email
              const whatsappLink = property.whatsapp
                ? `https://wa.me/${property.whatsapp.countryCode}${property.whatsapp.number}`
                : null
              const typeLabel = (property.type || property.propertyType || 'property').toLowerCase()

              return (
                <div
                  key={property._id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row ${
                    property.isDeleted ? 'opacity-75' : ''
                  }`}
                >
                  {/* ── Image (left on desktop, top on mobile) ── */}
                  <Link
                    href={`/properties/${property._id}`}
                    className="relative w-full md:w-72 h-52 md:h-auto flex-shrink-0 bg-gray-100 block"
                  >
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : property.videos && property.videos.length > 0 ? (
                      <>
                        <video
                          src={property.videos[0]}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 text-primary px-2.5 py-1 rounded-md text-xs font-bold capitalize shadow-sm">
                        {t(`propertyType.${typeLabel}`) || typeLabel}
                      </span>
                    </div>

                    {/* Not available overlay */}
                    {property.isDeleted && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold">
                          {t('propertiesPage.notAvailable')}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* ── Details (right on desktop, below image on mobile) ── */}
                  <div className="p-4 flex flex-col flex-1 min-w-0">

                    {/* Price */}
                    {property.price ? (
                      <div className="text-xl font-extrabold text-primary mb-1">
                        {property.price.toLocaleString()} EGP
                        <span className="text-sm text-gray-500 font-normal ml-1">/{t('properties.month')}</span>
                      </div>
                    ) : null}

                    {/* Title */}
                    <Link href={`/properties/${property._id}`}>
                      <h3 className="font-semibold text-gray-900 text-base mb-1.5 hover:text-primary line-clamp-2 leading-snug">
                        {property.title}
                      </h3>
                    </Link>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{property.location.area}, {property.location.city}</span>
                    </div>

                    {/* Beds / Baths / Area */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3 mb-3">
                      {property.bedrooms ? (
                        <span className="flex items-center gap-1">
                          <span className="text-base">🛏</span>
                          <span>{property.bedrooms} {t('propertiesPage.br')}</span>
                        </span>
                      ) : null}
                      {property.bathrooms ? (
                        <span className="flex items-center gap-1">
                          <span className="text-base">🚿</span>
                          <span>{property.bathrooms} {t('propertiesPage.ba')}</span>
                        </span>
                      ) : null}
                      {property.area ? (
                        <span className="flex items-center gap-1">
                          <span className="text-base">📐</span>
                          <span>{property.area} m²</span>
                        </span>
                      ) : null}
                      <span className="ml-auto flex items-center gap-1 text-xs text-gray-400">
                        <span>👁</span>
                        <span>{property.views || 0}</span>
                      </span>
                    </div>

                    {/* Amenities */}
                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {property.amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 4 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                            +{property.amenities.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-auto pt-2">
                      {property.isDeleted && isOwner ? (
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`${API_URL}/api/properties/${property._id}/restore`, {
                                method: 'POST'
                              })
                              const data = await response.json()
                              if (data.success) fetchProperties()
                            } catch (error) {
                              console.error('Restore error:', error)
                            }
                          }}
                          className="btn btn-primary flex-1 text-sm"
                        >
                          {t('propertiesPage.restore')}
                        </button>
                      ) : (
                        <Link
                          href={`/properties/${property._id}`}
                          className="btn btn-primary flex-1 text-sm text-center"
                        >
                          {t('propertiesPage.viewDetails')}
                        </Link>
                      )}

                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl py-2 text-sm font-semibold transition-colors"
                        >
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.345.223-.643.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
            {/* Prev */}
            <button
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('dots')
                acc.push(p)
                return acc
              }, [])
              .map((item, idx) =>
                item === 'dots' ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => { setCurrentPage(item as number); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === item
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item}
                  </button>
                )
              )
            }

            {/* Next */}
            <button
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PropertiesPageContent />
    </Suspense>
  )
}
