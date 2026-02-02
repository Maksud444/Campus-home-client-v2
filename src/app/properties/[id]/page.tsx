'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { citiesWithAreas } from '@/data/cities'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export default function EditPropertyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'property',
    price: '',
    city: '',
    area: '',
    address: '',
    whatsappCountryCode: '+20',
    whatsappNumber: '',
    bedrooms: '',
    bathrooms: '',
    propertyArea: '',
    propertyType: 'apartment',
    furnished: false,
    amenities: [] as string[],
    images: [] as string[],
    preferences: '',
    targetAudience: 'students'
  })

  const egyptCities = Object.keys(citiesWithAreas || {}).sort()
  const selectedCityAreas = formData.city ? (citiesWithAreas as any)[formData.city] || [] : []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && propertyId) {
      fetchProperty()
    }
  }, [status, propertyId])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`)
      const data = await response.json()

      if (data.success && data.property) {
        const property = data.property

        // Check ownership
        if (property.userEmail !== session?.user?.email) {
          alert('You are not authorized to edit this property')
          router.push('/properties')
          return
        }

        // Extract image URLs
        const imageUrls = (property.images || []).map((img: any) => 
          typeof img === 'string' ? img : img.url
        )

        setFormData({
          title: property.title || '',
          description: property.description || '',
          type: property.type || 'property',
          price: property.price?.toString() || '',
          city: property.location?.city || '',
          area: property.location?.area || '',
          address: property.location?.address || '',
          whatsappCountryCode: property.whatsapp?.countryCode || '+20',
          whatsappNumber: property.whatsapp?.number || '',
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          propertyArea: property.area?.toString() || '',
          propertyType: property.propertyType || 'apartment',
          furnished: property.furnished || false,
          amenities: property.amenities || [],
          images: imageUrls,
          preferences: property.preferences || '',
          targetAudience: property.targetAudience || 'students'
        })
      } else {
        alert('Property not found')
        router.push('/properties')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      alert('Failed to load property')
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingImages(true)
    setError('')

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`Image ${i + 1}: File must be less than 5MB`)
        }

        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: uploadFormData
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || `Failed to upload image ${i + 1}`)
        }

        uploadedUrls.push(uploadResult.url)
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

      setSuccess(`${uploadedUrls.length} image(s) uploaded!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload images')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.description.trim()) throw new Error('Description is required')
      if (!formData.city) throw new Error('City is required')
      if (!formData.area) throw new Error('Area is required')
      if (!formData.whatsappNumber) throw new Error('WhatsApp number is required')
      if (formData.images.length < 3) throw new Error('At least 3 images required')

      const response = await fetch(`${API_URL}/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          type: formData.type,
          price: formData.price ? parseFloat(formData.price) : null,
          location: {
            city: formData.city,
            area: formData.area,
            address: formData.address
          },
          whatsapp: {
            countryCode: formData.whatsappCountryCode,
            number: formData.whatsappNumber
          },
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: formData.propertyArea ? parseFloat(formData.propertyArea) : null,
          propertyType: formData.propertyType,
          furnished: formData.furnished,
          amenities: formData.amenities,
          images: formData.images.map(url => ({ url, public_id: '' })),
          preferences: formData.preferences,
          targetAudience: formData.targetAudience
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update property')
      }

      setSuccess('Property updated! Redirecting...')
      
      setTimeout(() => {
        router.push(`/properties/${propertyId}`)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to update property')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href={`/properties/${propertyId}`}
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 font-semibold"
        >
          ← Back to Property
        </Link>

        <h1 className="text-4xl font-extrabold mb-8">Edit Property</h1>

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

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-2 font-semibold">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
              disabled={saving}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[120px]"
              required
              disabled={saving}
            />
          </div>

          {/* City & Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold">
                City <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value, area: '' })}
                className="input"
                required
                disabled={saving}
              >
                <option value="">Select City</option>
                {egyptCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold">
                Area <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="input"
                required
                disabled={saving || !formData.city}
              >
                <option value="">{formData.city ? 'Select Area' : 'Select City First'}</option>
                {selectedCityAreas.map((area: string) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block mb-2 font-semibold">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <select
                value={formData.whatsappCountryCode}
                onChange={(e) => setFormData({ ...formData, whatsappCountryCode: e.target.value })}
                className="input w-32"
                disabled={saving}
              >
                <option value="+20">🇪🇬 +20</option>
                <option value="+880">🇧🇩 +880</option>
                <option value="+91">🇮🇳 +91</option>
              </select>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                className="input flex-1"
                placeholder="1234567890"
                maxLength={11}
                required
                disabled={saving}
              />
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 font-semibold">Monthly Rent (EGP)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              disabled={saving}
            />
          </div>

          {/* Property Details */}
          {formData.type === 'property' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="input"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="input"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold">Area (sqm)</label>
                  <input
                    type="number"
                    value={formData.propertyArea}
                    onChange={(e) => setFormData({ ...formData, propertyArea: e.target.value })}
                    className="input"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block mb-3 font-semibold">Amenities</label>
                <div className="grid grid-cols-4 gap-3">
                  {amenitiesList.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-lg border-2 text-sm font-semibold ${
                        formData.amenities.includes(amenity)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-200'
                      }`}
                      disabled={saving}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Images */}
          <div>
            <label className="block mb-3 font-semibold">
              Images <span className="text-red-500">* (Min 3)</span>
            </label>
            
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={saving || uploadingImages}
            />
            <label
              htmlFor="image-upload"
              className={`btn btn-outline inline-block cursor-pointer mb-4 ${
                (saving || uploadingImages) ? 'opacity-50' : ''
              }`}
            >
              {uploadingImages ? 'Uploading...' : '📷 Add Images'}
            </label>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              {formData.images.length} / Min 3 required
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving || uploadingImages || formData.images.length < 3}
              className="btn btn-primary flex-1"
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <Link
              href={`/properties/${propertyId}`}
              className="btn btn-outline flex-1 text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}