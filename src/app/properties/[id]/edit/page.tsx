'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export default function EditPropertyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    price: '',
    city: '',
    area: '',
    address: '',
    propertyType: 'apartment',
    bedrooms: '',
    bathrooms: '',
    areaSize: '',
    furnished: false,
    amenities: [] as string[],
    whatsappCountryCode: '+20',
    whatsappNumber: '',
    targetAudience: 'students'
  })

  const [newAmenity, setNewAmenity] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (propertyId && status === 'authenticated') {
      fetchProperty()
    }
  }, [propertyId, status])

  async function fetchProperty() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`)
      const data = await response.json()

      if (data.success && data.property) {
        const prop = data.property

        // Check if user owns this property
        if (session?.user?.email !== prop.userEmail) {
          alert('You do not have permission to edit this property')
          router.push(`/properties/${propertyId}`)
          return
        }

        setFormData({
          title: prop.title || '',
          description: prop.description || '',
          type: prop.type || 'apartment',
          price: prop.price?.toString() || '',
          city: prop.location?.city || '',
          area: prop.location?.area || '',
          address: prop.location?.address || '',
          propertyType: prop.propertyType || 'apartment',
          bedrooms: prop.bedrooms?.toString() || '',
          bathrooms: prop.bathrooms?.toString() || '',
          areaSize: prop.area?.toString() || '',
          furnished: prop.furnished || false,
          amenities: prop.amenities || [],
          whatsappCountryCode: prop.whatsapp?.countryCode || '+20',
          whatsappNumber: prop.whatsapp?.number || '',
          targetAudience: prop.targetAudience || 'students'
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.city || !formData.area) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)

      const updateData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        price: formData.price ? parseInt(formData.price) : null,
        location: {
          city: formData.city,
          area: formData.area,
          address: formData.address
        },
        propertyType: formData.propertyType,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        area: formData.areaSize ? parseInt(formData.areaSize) : null,
        furnished: formData.furnished,
        amenities: formData.amenities,
        whatsapp: {
          countryCode: formData.whatsappCountryCode,
          number: formData.whatsappNumber
        },
        targetAudience: formData.targetAudience
      }

      const response = await fetch(`${API_URL}/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()

      if (data.success) {
        alert('Property updated successfully!')
        router.push(`/properties/${propertyId}`)
      } else {
        alert(data.message || 'Failed to update property')
      }
    } catch (error) {
      console.error('Error updating property:', error)
      alert('Failed to update property')
    } finally {
      setSaving(false)
    }
  }

  function handleAddAmenity() {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] })
      setNewAmenity('')
    }
  }

  function handleRemoveAmenity(amenity: string) {
    setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== amenity) })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href={`/properties/${propertyId}`}
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6 font-semibold"
        >
          ← Back to Property
        </Link>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-3xl font-extrabold mb-6">Edit Property</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Type */}
            <div>
              <label className="block mb-2 font-semibold">Property Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
                required
              >
                <option value="apartment">🏢 Apartment</option>
                <option value="room">🛏️ Room</option>
                <option value="roommate">👥 Roommate</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Types: Apartment, Room, Roommate</p>
            </div>

            {/* Title */}
            <div>
              <label className="block mb-2 font-semibold">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
                placeholder="e.g., Spacious 2BR Apartment in Downtown"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 font-semibold">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[150px]"
                required
                placeholder="Describe your property in detail..."
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="input"
                  required
                  placeholder="Cairo"
                  defaultValue="Cairo"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">Area *</label>
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Area</option>
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
            </div>

            <div>
              <label className="block mb-2 font-semibold">Address Details</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                placeholder="Street address, building number, etc."
              />
            </div>

            {/* Price */}
            <div>
              <label className="block mb-2 font-semibold">Monthly Price (EGP)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input"
                placeholder="e.g., 5000"
              />
            </div>

            {/* Property Details (for apartment/room types) */}
            {(formData.type === 'apartment' || formData.type === 'room') && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="input"
                      min="0"
                      placeholder="e.g., 2"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Bathrooms</label>
                    <input
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="input"
                      min="0"
                      placeholder="e.g., 1"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold">Area (m²)</label>
                    <input
                      type="number"
                      value={formData.areaSize}
                      onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                      className="input"
                      min="0"
                      placeholder="e.g., 100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Property Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="input"
                  >
                    <option value="apartment">Apartment</option>
                    <option value="villa">Villa</option>
                    <option value="studio">Studio</option>
                    <option value="house">House</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="furnished"
                    checked={formData.furnished}
                    onChange={(e) => setFormData({ ...formData, furnished: e.target.checked })}
                    className="w-5 h-5 text-primary"
                  />
                  <label htmlFor="furnished" className="font-semibold">Furnished</label>
                </div>
              </>
            )}

            {/* Amenities */}
            <div>
              <label className="block mb-2 font-semibold">Amenities</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                  className="input flex-1"
                  placeholder="Add amenity (e.g., WiFi, AC, Parking)"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="btn btn-outline"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="hover:text-red-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block mb-2 font-semibold">WhatsApp Contact *</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={formData.whatsappCountryCode}
                  onChange={(e) => setFormData({ ...formData, whatsappCountryCode: e.target.value })}
                  className="input"
                  required
                >
                  <option value="+20">+20 (Egypt)</option>
                  <option value="+966">+966 (Saudi Arabia)</option>
                  <option value="+971">+971 (UAE)</option>
                  <option value="+962">+962 (Jordan)</option>
                </select>
                <input
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="input col-span-2"
                  required
                  placeholder="1234567890"
                />
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block mb-2 font-semibold">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="input"
              >
                <option value="students">🎓 Students</option>
                <option value="family">👨‍👩‍👧‍👦 Family</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary flex-1"
              >
                {saving ? 'Saving...' : '✓ Save Changes'}
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
    </div>
  )
}
