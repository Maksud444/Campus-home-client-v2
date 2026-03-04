'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { citiesWithAreas } from '@/data/cities'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNotifications } from '@/contexts/NotificationContext'
import Toast from '@/components/ui/Toast'
import imageCompression from 'browser-image-compression'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'



export default function CreatePostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useLanguage()
  const { addNotification } = useNotifications()
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingMedia, setUploadingMedia] = useState(false)

  const [gpsLoading, setGpsLoading] = useState(false)

  // Static area list + Nominatim search
  const STATIC_AREAS = [
    'ابو يوسف (تبة)', 'باب الشرعية', 'باب الفطور', 'بركات (دراسة)', 'تبة',
    'التجمع الخامس', 'حي الثامن', 'حي العاشر', 'حي السابع', 'خان خليل',
    'دراسة', 'دوية', 'دجلة المعادي', 'رمسيس', 'زهراء', 'زهراء المعادي',
    'ميدان التحرير', 'سيدة عائشة', 'سيدة زينب', 'عتبة', 'عباسية',
    'عبدي باشا', 'عباس العقاد', 'مستشفى حسين', 'مدينة البعوث', 'منهل',
    'مكرم عبيد', 'مدينة نصر', 'مصطفى النحاس', 'مقطم', 'معادي', 'مهندسين', 'نادي غمالية', 'ميدان الغيش'
  ]
  const [areaQuery, setAreaQuery] = useState('')
  const [areaSuggestions, setAreaSuggestions] = useState<{ name: string; display: string }[]>([])
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false)
  const [areaSearching, setAreaSearching] = useState(false)
  const areaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const filteredStaticAreas = areaQuery.trim()
    ? STATIC_AREAS.filter(a => a.includes(areaQuery.trim()))
    : STATIC_AREAS

  const fetchAreaSuggestions = async (q: string) => {
    if (!q.trim()) { setAreaSuggestions([]); return }
    setAreaSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' Cairo Egypt')}&countrycodes=EG&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setAreaSuggestions(data.map((r: any) => ({
        name: r.name || r.display_name.split(',')[0],
        display: r.display_name,
      })))
    } catch { } finally { setAreaSearching(false) }
  }

  const handleAreaInput = (val: string) => {
    setAreaQuery(val)
    setFormData(prev => ({ ...prev, selectedArea: val }))
    setShowAreaSuggestions(true)
    if (areaTimer.current) clearTimeout(areaTimer.current)
    areaTimer.current = setTimeout(() => fetchAreaSuggestions(val), 400)
  }

  const selectArea = (name: string) => {
    setAreaQuery(name)
    setFormData(prev => ({ ...prev, selectedArea: name }))
    setShowAreaSuggestions(false)
    setAreaSuggestions([])
  }

  const showAreaDropdown = showAreaSuggestions && (filteredStaticAreas.length > 0 || areaSuggestions.length > 0)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'property',
    price: '',
    city: 'Cairo',
    selectedArea: '',
    addressDetails: '',
    latitude: '',
    longitude: '',
    whatsappCountryCode: '+20',
    whatsappNumber: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    propertyType: 'apartment',
    furnished: false,
    amenities: [] as string[],
    images: [] as string[],
    videos: [] as string[],
    preferences: '',
    targetAudience: 'students'
  })

  const egyptCities = Object.keys(citiesWithAreas).sort()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const amenitiesList = [
    'WiFi', 'AC', 'Parking', 'Elevator', 'Security',
    'Balcony', 'Washing Machine', 'Furnished',
    'Refrigerator', 'Burner Stove', 'Sofa', 'Wardrobe', 'Water Heater', 'Bed'
  ]

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(t('post.geoNotSupported'))
      return
    }
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({ ...prev, latitude: String(latitude), longitude: String(longitude) }))
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          const road = data.address?.road || data.address?.neighbourhood || ''
          const suburb = data.address?.suburb || data.address?.quarter || ''
          const addressText = [road, suburb].filter(Boolean).join(', ')
          if (addressText) {
            setFormData(prev => ({ ...prev, addressDetails: addressText, latitude: String(latitude), longitude: String(longitude) }))
          }
        } catch {
          // Reverse geocoding failed — coords still saved
        }
        setGpsLoading(false)
      },
      () => {
        alert(t('post.geoError'))
        setGpsLoading(false)
      },
      { timeout: 10000 }
    )
  }

  const MAX_IMAGES = 6

 const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
  const files = e.target.files
  if (!files || files.length === 0) return

  if (type === 'image') {
    const remaining = MAX_IMAGES - formData.images.length
    if (remaining <= 0) {
      setError(t('post.maxImagesError'))
      e.target.value = ''
      return
    }
    if (files.length > remaining) {
      setError(`You can only upload ${remaining} more image(s). Maximum is ${MAX_IMAGES}.`)
      e.target.value = ''
      return
    }
  }

  setUploadingMedia(true)
  setError('')

  try {
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      let fileToUpload: File | Blob = file

      if (type === 'image') {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${i + 1} "${file.name}": Only image files are allowed`)
        }

        // ── Compression ──────────────────────────────────────────────
        // Budget: total 250 KB across all 6 images → ~40 KB per image
        const totalAfterUpload = formData.images.length + files.length
        const perImageKB = Math.max(30, Math.floor(250 / Math.max(totalAfterUpload, 1)))

        setSuccess(`Compressing image ${i + 1}/${files.length}...`)

        fileToUpload = await imageCompression(file, {
          maxSizeMB: perImageKB / 1024,      // e.g. 40 KB → 0.039 MB
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: 'image/jpeg',
          initialQuality: 0.8,
        })

        const compressedKB = (fileToUpload.size / 1024).toFixed(1)
        const originalKB   = (file.size / 1024).toFixed(1)
        console.log(`✅ ${file.name}: ${originalKB} KB → ${compressedKB} KB`)
        // ─────────────────────────────────────────────────────────────
      } else {
        if (!file.type.startsWith('video/')) {
          throw new Error(`File ${i + 1} "${file.name}": Only video files are allowed`)
        }
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`Video ${i + 1}: File size must be less than 50MB`)
        }
      }

      setSuccess(`Uploading ${i + 1}/${files.length}...`)

      const uploadFormData = new FormData()
      uploadFormData.append('file', fileToUpload)

      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult.message || `Failed to upload ${type} ${i + 1}`)
      }

      if (uploadResult.url) {
        uploadedUrls.push(uploadResult.url)
      }
    }

    if (type === 'image') {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
    } else {
      setFormData(prev => ({ ...prev, videos: [...prev.videos, ...uploadedUrls] }))
    }

    setSuccess(`${uploadedUrls.length} ${type}(s) uploaded successfully!`)
    setTimeout(() => setSuccess(''), 3000)

  } catch (err: any) {
    console.error(`❌ Upload error:`, err)
    setError(err.message || `Failed to upload ${type}s`)
  } finally {
    setUploadingMedia(false)
  }
}

  const removeMedia = (index: number, type: 'image' | 'video') => {
    if (type === 'image') {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate WhatsApp number
      if (!formData.whatsappNumber) {
        throw new Error(t('post.whatsappRequired'))
      }

      if (formData.whatsappNumber.length < 10 || formData.whatsappNumber.length > 11) {
        throw new Error(t('post.whatsappLength'))
      }

      // Validate images count (min 3, max 6)
      if (formData.images.length < 3) {
        throw new Error(t('post.minImages'))
      }
      if (formData.images.length > MAX_IMAGES) {
        throw new Error(t('post.maxImagesError'))
      }

      // Submit to local API for admin approval before going live
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          price: formData.price ? parseFloat(formData.price) : null,
          location: {
            city: formData.city,
            area: formData.selectedArea,
            address: formData.addressDetails,
            ...(formData.latitude && formData.longitude ? {
              coordinates: { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
            } : {})
          },
          whatsapp: {
            countryCode: formData.whatsappCountryCode,
            number: formData.whatsappNumber
          },
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: formData.area ? parseFloat(formData.area) : null,
          propertyType: formData.propertyType,
          furnished: formData.furnished,
          amenities: formData.amenities,
          images: formData.images.map(url => ({ url, public_id: '' })),
          videos: formData.videos,
          preferences: formData.preferences,
          targetAudience: formData.targetAudience,
          userId: (session?.user as any)?.id || session?.user?.email?.split('@')[0],
          userName: session?.user?.name || 'Anonymous',
          userEmail: session?.user?.email,
          userImage: session?.user?.image,
          userRole: (session?.user as any)?.role || 'student'
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create property')
      }

      console.log('✅ Property created:', data.property)
      setSuccess(t('post.successMessage'))
      setShowToast(true)
      addNotification(t('post.toastSuccess'), 'success')

      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 3000)
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(err.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userRole = (session.user as any)?.role || 'student'

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      {showToast && (
        <Toast
          message={t('post.toastSuccess')}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 font-semibold"
          >
            {t('post.backToHome')}
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {userRole === 'owner' ? t('post.listYourProperty') :
             userRole === 'agent' ? t('post.addPropertyListing') :
             t('post.title')}
          </h1>
          <p className="text-gray-600 text-lg">
            {userRole === 'owner' ? t('post.listYourPropertySub') :
             userRole === 'agent' ? t('post.addPropertyListingSub') :
             t('post.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
          {/* Post Type */}
          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700">
              {t('post.type')} <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'property' })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.type === 'property'
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">🏠</div>
                <div className="font-bold">{t('post.property')}</div>
                <div className="text-sm text-gray-600">{t('post.propertyDesc')}</div>
              </button>

              {userRole === 'student' && (
                <>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'roommate' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'roommate'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">👥</div>
                    <div className="font-bold">{t('post.lookingRoommate')}</div>
                    <div className="text-sm text-gray-600">{t('post.lookingRoommateDesc')}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'room' })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      formData.type === 'room'
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="font-bold">{t('post.lookingRoom')}</div>
                    <div className="text-sm text-gray-600">{t('post.lookingRoomDesc')}</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              {t('post.titleLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder={t('post.titlePh')}
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              {t('post.description')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              rows={5}
              placeholder={t('post.descriptionPlaceholder')}
              required
              disabled={loading}
            />
          </div>

          {/* Preferences */}
          {(formData.type === 'roommate' || formData.type === 'room') && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                {t('post.preferences')}
              </label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                className="input resize-none"
                rows={3}
                placeholder={t('post.preferencesPh')}
                disabled={loading}
              />
            </div>
          )}

          {/* City & Area */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  {t('post.city')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    city: e.target.value,
                    selectedArea: ''
                  })}
                  className="input"
                  required
                  disabled={loading}
                >
                  <option value="">{t('post.selectCity')}</option>
                  {egyptCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  {t('post.areaLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={areaQuery}
                    onChange={(e) => handleAreaInput(e.target.value)}
                    onFocus={() => setShowAreaSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 200)}
                    placeholder={t('post.searchArea')}
                    className="input pr-8"
                    required
                    disabled={loading}
                  />
                  {areaSearching && (
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  )}
                  {showAreaDropdown && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto z-50">
                      {filteredStaticAreas.map((loc) => (
                        <button key={loc} type="button" onMouseDown={() => selectArea(loc)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0">
                          <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          <span className="text-sm text-gray-700">{loc}</span>
                        </button>
                      ))}
                      {areaSuggestions.length > 0 && (
                        <>
                          <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-gray-100">{t('post.searchResults')}</div>
                          {areaSuggestions.map((r, i) => (
                            <button key={`n-${i}`} type="button" onMouseDown={() => selectArea(r.name)}
                              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-50 last:border-0">
                              <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
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
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              {t('post.addressDetails')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.addressDetails}
                onChange={(e) => setFormData({ ...formData, addressDetails: e.target.value })}
                className="input flex-1"
                placeholder={t('post.addressPh')}
                disabled={loading}
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loading || gpsLoading}
                title="Use my current location"
                className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex-shrink-0"
              >
                {gpsLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <span className="hidden sm:inline">{gpsLoading ? t('post.gettingLocation') : t('post.liveLocation')}</span>
              </button>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                {t('post.locationCaptured')} ({parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)})
              </p>
            )}
          </div>

          {/* WhatsApp Number with Country Code */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              {t('post.whatsapp')} <span className="text-red-500">*</span>
            </label>
            <PhoneInput
              country={'eg'}
              value={formData.whatsappCountryCode.replace('+', '') + formData.whatsappNumber}
              onChange={(value, country: any) => {
                const dialCode = country?.dialCode || '20'
                const localNumber = value.slice(dialCode.length)
                setFormData(prev => ({
                  ...prev,
                  whatsappCountryCode: '+' + dialCode,
                  whatsappNumber: localNumber
                }))
              }}
              enableSearch
              searchPlaceholder="Search country..."
              disabled={loading}
              inputStyle={{
                width: '100%',
                height: '44px',
                fontSize: '14px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                paddingLeft: '52px',
                color: '#111827',
                background: loading ? '#f9fafb' : '#fff',
              }}
              buttonStyle={{
                borderRadius: '12px 0 0 12px',
                border: '1px solid #e5e7eb',
                borderRight: 'none',
                background: loading ? '#f9fafb' : '#fff',
              }}
              containerStyle={{ width: '100%' }}
              dropdownStyle={{ zIndex: 9999 }}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('post.whatsappHint')}
            </p>
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              {t('post.monthlyRent')}
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              placeholder={t('post.rentPh')}
              disabled={loading}
            />
          </div>

          {/* Property Details */}
          {formData.type === 'property' && (
            <>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  {t('post.propertyTypeLabel')}
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  className="input"
                  disabled={loading}
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="house">House</option>
                </select>
              </div>

              {/* Target Audience */}
              {(userRole === 'agent' || userRole === 'owner') && (
                <div className="mb-6">
                  <label className="block mb-3 font-semibold text-gray-700">
                    {t('post.targetAudience')} <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, targetAudience: 'family' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.targetAudience === 'family'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
                      <div className="font-bold">{t('post.forFamily')}</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, targetAudience: 'students' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.targetAudience === 'students'
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🎓</div>
                      <div className="font-bold">{t('post.forStudents')}</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">{t('post.bedrooms')}</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="input"
                    placeholder="2"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">{t('post.bathrooms')}</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="input"
                    placeholder="1"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">{t('post.areaSqm')}</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="input"
                    placeholder="100"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.furnished}
                    onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
                    className="w-5 h-5 text-primary rounded"
                    disabled={loading}
                  />
                  <span className="font-semibold text-gray-700">{t('post.furnished')}</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-semibold text-gray-700">{t('post.amenities')}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {amenitiesList.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-semibold ${
                        formData.amenities.includes(amenity)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Images */}
          <div className="mb-6">
            <label className="block mb-3 font-semibold text-gray-700">
              {t('post.images')} <span className="text-red-500">* (Min 3 — Max 6)</span>
            </label>

            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMediaUpload(e, 'image')}
                className="hidden"
                id="image-upload"
                disabled={loading || uploadingMedia || formData.images.length >= MAX_IMAGES}
              />
              <label
                htmlFor={formData.images.length >= MAX_IMAGES ? undefined : 'image-upload'}
                className={`btn btn-outline inline-block ${
                  (loading || uploadingMedia || formData.images.length >= MAX_IMAGES)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {uploadingMedia ? t('post.uploading') :
                  formData.images.length >= MAX_IMAGES ? t('post.maxImagesReached') : t('post.uploadImages')}
              </label>
            </div>

            {formData.images.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-gray-700">
                  {t('post.uploaded')} {formData.images.length} / {MAX_IMAGES} (minimum 3 required)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Upload ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(index, 'image')}
                        className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>


          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || uploadingMedia || formData.images.length < 3}
              className="btn btn-primary flex-1"
            >
              {loading ? t('post.creating') : t('post.createBtn')}
            </button>
            <Link
              href="/"
              className="btn btn-outline flex-1 text-center"
            >
              {t('post.cancel')}
            </Link>
          </div>

          {formData.images.length < 3 && (
            <p className="text-sm text-red-600 mt-4 text-center">
              ⚠️ {t('post.minImages')}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}