'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function EditPropertyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'property',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    propertyType: 'apartment',
    furnished: false,
    amenities: [] as string[],
    images: [] as string[]
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchProperty()
    }
  }, [status, propertyId])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://student-housing-backend.vercel.app/api/properties/${propertyId}`)
      const data = await response.json()

      if (data.success) {
        const property = data.property

        // Check if user owns the property
        if (property.userEmail !== session?.user?.email) {
          alert('You are not authorized to edit this property')
          router.push('/properties')
          return
        }

        setFormData({
          title: property.title,
          description: property.description,
          type: property.type,
          price: property.price?.toString() || '',
          location: property.location,
          bedrooms: property.bedrooms?.toString() || '',
          bathrooms: property.bathrooms?.toString() || '',
          area: property.area?.toString() || '',
          propertyType: property.propertyType || 'apartment',
          furnished: property.furnished || false,
          amenities: property.amenities || [],
          images: property.images || []
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
          throw new Error('Image size must be less than 5MB')
        }
        if (!file.type.startsWith('image/')) {
          throw new Error('Only images are allowed')
        }

        const uploadFormData = new FormData()
        uploadFormData.append('image', file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(uploadResult.message || 'Failed to upload image')
        }

        if (uploadResult.success && uploadResult.url) {
          uploadedUrls.push(uploadResult.url)
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))

      setSuccess(`${uploadedUrls.length} image(s) uploaded successfully!`)
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
      if (!formData.title || !formData.description || !formData.location) {
        throw new Error('Please fill in all required fields')
      }

      const response = await fetch(`https://student-housing-backend.vercel.app/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          area: formData.area ? parseFloat(formData.area) : null,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update property')
      }

      setSuccess('Property updated successfully! Redirecting...')
      
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

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href={`/properties/${propertyId}`}
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 font-semibold"
          >
            ← Back to Property
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Edit Property</h1>
          <p className="text-gray-600 text-lg">Update your property listing</p>
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
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
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

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input resize-none"
              rows={5}
              required
              disabled={saving}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              required
              disabled={saving}
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Monthly Rent (EGP)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="input"
              disabled={saving}
            />
          </div>

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
                  disabled={saving}
                >
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                  <option value="house">House</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className="input"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className="input"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-700">Area (sqm)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="input"
                    disabled={saving}
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
                    disabled={saving}
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
                      disabled={saving}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mb-8">
            <label className="block mb-3 font-semibold text-gray-700">Images</label>
            
            <div className="mb-4">
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
                className={`btn btn-outline inline-block cursor-pointer ${
                  (saving || uploadingImages) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingImages ? 'Uploading...' : '📷 Add More Images'}
              </label>
            </div>

            {formData.images.length > 0 && (
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
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving || uploadingImages}
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