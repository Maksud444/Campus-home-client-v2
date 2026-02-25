'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
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

      const response = await fetch(`${API_URL}/api/properties`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProperties(data.properties)
      } else {
        throw new Error(data.message || 'Failed to fetch properties')
      }
    } catch (err: any) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
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
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky one-line filter bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">

            {/* Search input */}
            <div className="relative flex-1 min-w-[160px]">
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
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-bold text-primary">{filteredProperties.length}</span> {t('stats.properties').toLowerCase()} {t('propertiesPage.found')}
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
            {filteredProperties.map((property) => {
              const isOwner = session?.user?.email === property.userId?.email
              const whatsappLink = property.whatsapp
                ? `https://wa.me/${property.whatsapp.countryCode}${property.whatsapp.number}`
                : null
              const typeLabel = (property.propertyType || property.type || 'apartment').toLowerCase()

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
                          className="btn btn-outline flex-1 text-sm text-center"
                        >
                          💬 {t('propertiesPage.whatsapp')}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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
