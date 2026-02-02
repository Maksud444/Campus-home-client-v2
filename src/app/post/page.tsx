'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { citiesWithAreas } from '@/data/cities'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

// Country codes list
const COUNTRY_CODES = [
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
]

export default function CreatePostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingMedia, setUploadingMedia] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'property',
    price: '',
    city: '',
    selectedArea: '',
    addressDetails: '',
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
  const selectedCityAreas = formData.city ? citiesWithAreas[formData.city] || [] : []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const amenitiesList = [
    'WiFi', 'AC', 'Parking', 'Elevator', 'Security', 'Gym', 
    'Pool', 'Garden', 'Balcony', 'Kitchen', 'Washing Machine', 'Furnished'
  ]

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  // Handle WhatsApp number input - only digits, max 11
  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only digits
    if (value.length <= 11) {
      setFormData({ ...formData, whatsappNumber: value })
    }
  }

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
  const files = e.target.files
  if (!files || files.length === 0) return

  setUploadingMedia(true)
  setError('')

  try {
    console.log(`📤 Uploading ${files.length} ${type}(s)...`)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file
      if (type === 'image') {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Image ${i + 1}: File size must be less than 5MB`)
        }
        if (!file.type.startsWith('image/')) {
          throw new Error(`Image ${i + 1}: Only images are allowed`)
        }
      } else {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`Video ${i + 1}: File size must be less than 50MB`)
        }
        if (!file.type.startsWith('video/')) {
          throw new Error(`Video ${i + 1}: Only videos are allowed`)
        }
      }

      console.log(`📤 Uploading ${type} ${i + 1}/${files.length}:`, file.name)

      // Create FormData
      const uploadFormData = new FormData()
      uploadFormData.append('file', file) // IMPORTANT: Changed from 'image'/'video' to 'file'

      // Upload to BACKEND (not frontend API route)
      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData
      })

      const uploadResult = await uploadResponse.json()
      console.log(`📥 Upload response ${i + 1}:`, uploadResult)

      if (!uploadResponse.ok || !uploadResult.success) {
        throw new Error(uploadResult.message || `Failed to upload ${type} ${i + 1}`)
      }

      if (uploadResult.url) {
        uploadedUrls.push(uploadResult.url)
        console.log(`✅ ${type} ${i + 1} uploaded:`, uploadResult.url)
      }
    }

    // Update state with uploaded URLs
    if (type === 'image') {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        videos: [...prev.videos, ...uploadedUrls]
      }))
    }

    console.log(`✅ All ${uploadedUrls.length} ${type}(s) uploaded successfully`)
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
        throw new Error('WhatsApp number is required')
      }

      if (formData.whatsappNumber.length < 10 || formData.whatsappNumber.length > 11) {
        throw new Error('WhatsApp number must be 10-11 digits')
      }

      // Validate minimum images
      if (formData.images.length < 3) {
        throw new Error('Please upload at least 3 images')
      }

      const token = (session as any)?.accessToken

      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          price: formData.price ? parseFloat(formData.price) : null,
          location: {
            city: formData.city,
            area: formData.selectedArea,
            address: formData.addressDetails
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
      setSuccess('Property created successfully! Redirecting...')
      
      setTimeout(() => {
        router.push('/properties')
        router.refresh()
      }, 1500)
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 font-semibold"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {userRole === 'owner' ? 'List Your Property' : 
             userRole === 'agent' ? 'Add Property Listing' : 
             'Create Post'}
          </h1>
          <p className="text-gray-600 text-lg">
            {userRole === 'owner' ? 'List your property for rent' : 
             userRole === 'agent' ? 'Add a new property to your listings' : 
             'Find a roommate or room'}
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
              Post Type <span className="text-red-500">*</span>
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
                <div className="font-bold">Property</div>
                <div className="text-sm text-gray-600">List a property</div>
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
                    <div className="font-bold">Looking for Roommate</div>
                    <div className="text-sm text-gray-600">Find someone to share</div>
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
                    <div className="font-bold">Looking for Room</div>
                    <div className="text-sm text-gray-600">Find a place to stay</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., Modern 2BR Apartment in Nasr City"
              required
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              rows={5}
              placeholder="Describe your property or requirements..."
              required
              disabled={loading}
            />
          </div>

          {/* Preferences */}
          {(formData.type === 'roommate' || formData.type === 'room') && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                Preferences / Requirements
              </label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                className="input resize-none"
                rows={3}
                placeholder="e.g., Only Indonesian/Malaysia/Uzbekistan/Bangladeshi students, Quiet environment, etc."
                disabled={loading}
              />
            </div>
          )}

          {/* City & Area */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  City <span className="text-red-500">*</span>
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
                  <option value="">Select a city</option>
                  {egyptCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.selectedArea}
                  onChange={(e) => setFormData({ ...formData, selectedArea: e.target.value })}
                  className="input"
                  required
                  disabled={loading || !formData.city}
                >
                  <option value="">
                    {formData.city ? 'Select an area' : 'First select a city'}
                  </option>
                  {selectedCityAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Additional Address Details
            </label>
            <input
              type="text"
              value={formData.addressDetails}
              onChange={(e) => setFormData({ ...formData, addressDetails: e.target.value })}
              className="input"
              placeholder="e.g., Street 9, Near Cairo Festival City Mall"
              disabled={loading}
            />
          </div>

          {/* WhatsApp Number with Country Code */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={formData.whatsappCountryCode}
                onChange={(e) => setFormData({ ...formData, whatsappCountryCode: e.target.value })}
                className="input w-40"
                disabled={loading}
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.flag} {item.code}
                  </option>
                ))}
              </select>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={handleWhatsAppChange}
                  className="input pr-16"
                  placeholder="1234567890"
                  maxLength={11}
                  required
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  {formData.whatsappNumber.length}/11
                </div>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter 10-11 digits only. No spaces or special characters.
            </p>
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Monthly Rent (EGP)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              placeholder="e.g., 3500"
              disabled={loading}
            />
          </div>

          {/* Property Details */}
          {formData.type === 'property' && (
            <>
              <div className="mb-6">
                <label className="block mb-2 font-semibold text-gray-700">
                  Property Type
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
                  <option value="room">Room</option>
                  <option value="house">House</option>
                </select>
              </div>

              {/* Target Audience */}
              {(userRole === 'agent' || userRole === 'owner') && (
                <div className="mb-6">
                  <label className="block mb-3 font-semibold text-gray-700">
                    Target Audience <span className="text-red-500">*</span>
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
                      <div className="font-bold">For Family</div>
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
                      <div className="font-bold">For Students</div>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Bedrooms</label>
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
                  <label className="block mb-2 font-semibold text-gray-700">Bathrooms</label>
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
                  <label className="block mb-2 font-semibold text-gray-700">Area (sqm)</label>
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
                  <span className="font-semibold text-gray-700">Furnished</span>
                </label>
              </div>

              <div className="mb-6">
                <label className="block mb-3 font-semibold text-gray-700">Amenities</label>
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
              Property Images <span className="text-red-500">* (Minimum 3)</span>
            </label>
            
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleMediaUpload(e, 'image')}
                className="hidden"
                id="image-upload"
                disabled={loading || uploadingMedia}
              />
              <label
                htmlFor="image-upload"
                className={`btn btn-outline inline-block cursor-pointer ${
                  (loading || uploadingMedia) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingMedia ? 'Uploading...' : '📷 Upload Images'}
              </label>
            </div>

            {formData.images.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-gray-700">
                  Uploaded: {formData.images.length} / Minimum 3 required
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

          {/* Videos */}
          <div className="mb-8">
            <label className="block mb-3 font-semibold text-gray-700">
              Property Videos <span className="text-gray-500">(Optional)</span>
            </label>
            
            <div className="mb-4">
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleMediaUpload(e, 'video')}
                className="hidden"
                id="video-upload"
                disabled={loading || uploadingMedia}
              />
              <label
                htmlFor="video-upload"
                className={`btn btn-outline inline-block cursor-pointer ${
                  (loading || uploadingMedia) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingMedia ? 'Uploading...' : '🎥 Upload Videos'}
              </label>
            </div>

            {formData.videos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <video
                      src={video}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(index, 'video')}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
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
              {loading ? 'Creating...' : '🚀 Create Post'}
            </button>
            <Link
              href="/"
              className="btn btn-outline flex-1 text-center"
            >
              Cancel
            </Link>
          </div>

          {formData.images.length < 3 && (
            <p className="text-sm text-red-600 mt-4 text-center">
              ⚠️ Please upload at least 3 images
            </p>
          )}
        </form>
      </div>
    </div>
  )
}