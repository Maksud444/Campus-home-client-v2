'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
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
  const router = useRouter()
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
    // Keyword search
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

  const getRemainingDays = (permanentDeleteAt?: string) => {
    if (!permanentDeleteAt) return 0
    const now = new Date()
    const deleteDate = new Date(permanentDeleteAt)
    const diffTime = deleteDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">{t('propertiesPage.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
            {t('propertiesPage.title')}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            {t('propertiesPage.subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-8">
          <h3 className="text-lg sm:text-xl font-bold mb-4">{t('propertiesPage.filters')}</h3>

          {/* Search Bar */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('propertiesPage.search')}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Location */}
            <div>
              <label className="block mb-2 text-xs sm:text-sm font-semibold text-gray-700">{t('propertiesPage.city')}</label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="input text-xs sm:text-sm"
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
            </div>

            {/* Type */}
            <div>
              <label className="block mb-2 text-xs sm:text-sm font-semibold text-gray-700">{t('propertiesPage.type')}</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input text-xs sm:text-sm"
              >
                <option value="">{t('propertiesPage.allTypes')}</option>
                <option value="property">{t('propertiesPage.propertyType')}</option>
                <option value="room">{t('propertiesPage.roomType')}</option>
                <option value="roommate">{t('propertiesPage.roommateType')}</option>
              </select>
            </div>

            {/* Price Dropdown */}
            <div ref={priceDropdownRef} className="relative">
              <label className="block mb-2 text-xs sm:text-sm font-semibold text-gray-700">{t('propertiesPage.price')}</label>
              <button
                type="button"
                onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                className={`input text-xs sm:text-sm w-full text-left flex items-center justify-between cursor-pointer ${
                  (filters.minPrice || filters.maxPrice) ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                <span className="truncate">{getPriceLabel()}</span>
                <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Price Dropdown Panel */}
              {showPriceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4">
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
                      onClick={() => {
                        setFilters({ ...filters, minPrice: '', maxPrice: '' })
                        setShowPriceDropdown(false)
                      }}
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
            <div>
              <label className="block mb-2 text-xs sm:text-sm font-semibold text-gray-700">{t('properties.bedrooms')}</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                className="input text-xs sm:text-sm"
              >
                <option value="">{t('propertiesPage.any')}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => { setFilters({ city: '', type: '', minPrice: '', maxPrice: '', bedrooms: '' }); setSearchQuery('') }}
            className="btn btn-outline mt-4 text-xs sm:text-sm"
          >
            {t('propertiesPage.clearFilters')}
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            {t('propertiesPage.found')} <span className="font-bold text-primary">{filteredProperties.length}</span> {t('stats.properties').toLowerCase()}
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t('propertiesPage.noProperties')}</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{t('propertiesPage.adjustFilters')}</p>
            <Link href="/post" className="btn btn-primary text-sm sm:text-base">
              {t('propertiesPage.addProperty')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => {
              const isOwner = session?.user?.email === property.userId?.email
              const remainingDays = getRemainingDays(property.permanentDeleteAt)
              const whatsappLink = property.whatsapp
                ? `https://wa.me/${property.whatsapp.countryCode}${property.whatsapp.number}`
                : null

              return (
                <div
                  key={property._id}
                  className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow relative ${
                    property.isDeleted ? 'opacity-75' : ''
                  }`}
                >
                  {property.isDeleted && (
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {t('propertiesPage.notAvailable')}
                      </div>
                    </div>
                  )}

                  <Link href={`/properties/${property._id}`} className="block relative h-56 bg-gray-200">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🏠
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold capitalize">
                        {property.propertyType || property.type || 'Apartment'}
                      </span>
                    </div>
                  </Link>

                  <div className="p-5">
                    <Link href={`/properties/${property._id}`}>
                      <h3 className="font-bold text-xl mb-2 hover:text-primary line-clamp-2">
                        {property.title}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <span>📍</span>
                      <span>{property.location.area}, {property.location.city}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {property.bedrooms && (
                        <span>🛏️ {property.bedrooms} {t('propertiesPage.br')}</span>
                      )}
                      {property.bathrooms && (
                        <span>🚿 {property.bathrooms} {t('propertiesPage.ba')}</span>
                      )}
                      {property.area && (
                        <span>📐 {property.area} m²</span>
                      )}
                    </div>

                    {property.price && (
                      <div className="mb-4">
                        <div className="text-2xl font-bold text-primary">
                          {property.price.toLocaleString()} EGP
                          <span className="text-sm text-gray-600 font-normal">/{t('properties.month')}</span>
                        </div>
                      </div>
                    )}

                    {property.amenities && property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                            +{property.amenities.length - 3} {t('propertiesPage.more')}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-4">
                      <span>👁️ {property.views || 0} {t('propertiesPage.views')}</span>
                      <span>❤️ {property.likes?.length || 0} {t('propertiesPage.likes')}</span>
                    </div>

                    <div className="flex gap-2">
                      {property.isDeleted && isOwner ? (
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`${API_URL}/api/properties/${property._id}/restore`, {
                                method: 'POST'
                              })
                              const data = await response.json()
                              if (data.success) {
                                fetchProperties()
                              }
                            } catch (error) {
                              console.error('Restore error:', error)
                            }
                          }}
                          className="btn btn-primary flex-1 text-xs sm:text-sm"
                        >
                          {t('propertiesPage.restore')}
                        </button>
                      ) : (
                        <Link
                          href={`/properties/${property._id}`}
                          className="btn btn-primary flex-1 text-xs sm:text-sm text-center"
                        >
                          {t('propertiesPage.viewDetails')}
                        </Link>
                      )}

                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline flex-1 text-xs sm:text-sm"
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
      <div className="min-h-screen bg-gray-50 py-8 pt-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <PropertiesPageContent />
    </Suspense>
  )
}
