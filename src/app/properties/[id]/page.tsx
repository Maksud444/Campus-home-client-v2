'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, MapPin, Bed, Bath, Maximize, Phone, Share2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

interface Property {
  _id: string
  title: string
  description: string
  type: string
  price: number | null
  location: {
    city: string
    area: string
    address?: string
  }
  propertyType: string
  bedrooms?: number
  bathrooms?: number
  area?: number
  furnished: boolean
  images: Array<{ url: string; public_id?: string }>
  videos?: string[]
  amenities: string[]
  preferences?: string
  targetAudience: string
  whatsapp: {
    countryCode: string
    number: string
  }
  userId?: string
  userName: string
  userEmail: string
  userImage?: string
  userRole: string
  status: string
  views: number
  likes: any[]
  createdAt: string
  updatedAt: string
}

export default function PropertyDetailPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  async function fetchProperty() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`)
      const data = await response.json()

      if (data.success && data.property) {
        console.log('📦 Property loaded:', data.property)
        setProperty(data.property)
      } else {
        alert('Property not found')
        router.push('/properties')
      }
    } catch (error) {
      console.error('❌ Error fetching property:', error)
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  function isOwner() {
    if (!session?.user || !property) return false
    
    console.log('👤 Checking ownership:')
    console.log('Session user email:', session.user.email)
    console.log('Property userEmail:', property.userEmail)
    console.log('Session user:', session.user)
    
    // Check email match or ID match
    const emailMatch = session.user.email === property.userEmail
    const idMatch = (session.user as any)?.id === property.userId
    
    console.log('✅ Email match:', emailMatch)
    console.log('✅ ID match:', idMatch)
    
    return emailMatch || idMatch
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      setDeleting(true)
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        alert('Property deleted successfully')
        router.push('/properties')
      } else {
        alert(data.message || 'Failed to delete property')
      }
    } catch (error) {
      console.error('❌ Error deleting property:', error)
      alert('Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  function getWhatsAppLink() {
    if (!property || !property.whatsapp) return '#'
    
    const { countryCode, number } = property.whatsapp
    const fullNumber = `${countryCode}${number}`.replace(/\D/g, '')
    const message = `Hi! I'm interested in your property:\n\n*${property.title}*\n\n📍 ${property.location.area}, ${property.location.city}\n💰 ${property.price ? property.price.toLocaleString() + ' EGP/mo' : 'Negotiable'}\n\nView: ${typeof window !== 'undefined' ? window.location.href : ''}`

    return `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`
  }

  const handleShare = async () => {
    if (!property) return
    
    const shareData = {
      title: property.title,
      text: property.description,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-4">Property not found</h2>
          <Link href="/properties" className="btn btn-primary">
            Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  const images = property.images || []
  const imageUrls = images.map(img => typeof img === 'string' ? img : img.url)

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-6xl mx-auto px-4">
        <Link 
          href="/properties"
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6 font-semibold"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-6">
              {imageUrls.length > 0 ? (
                <div>
                  <div className="relative h-96 bg-gray-200">
                    <Image
                      src={imageUrls[currentImageIndex]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    
                    {imageUrls.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === 0 ? imageUrls.length - 1 : prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === imageUrls.length - 1 ? 0 : prev + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all"
                        >
                          ›
                        </button>
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {imageUrls.length}
                        </div>
                      </>
                    )}

                    {/* Share Button */}
                    <button
                      onClick={handleShare}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {imageUrls.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {imageUrls.map((imageUrl, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${currentImageIndex === index ? 'ring-2 ring-primary' : ''}`}
                        >
                          <Image src={imageUrl} alt="Thumbnail" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gray-200 text-8xl">🏠</div>
              )}
            </div>

            {/* Videos */}
            {property.videos && property.videos.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Property Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.videos.map((video, index) => (
                    <video key={index} src={video} controls className="w-full rounded-lg" />
                  ))}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  property.type === 'property' ? 'bg-blue-500 text-white' :
                  property.type === 'roommate' ? 'bg-green-500 text-white' :
                  'bg-purple-500 text-white'
                }`}>
                  {property.type === 'property' ? '🏢 Property' :
                   property.type === 'roommate' ? '👥 Looking for Roommate' :
                   '🔍 Looking for Room'}
                </span>
                
                {property.targetAudience && (
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    property.targetAudience === 'family' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {property.targetAudience === 'family' ? '👨‍👩‍👧‍👦 For Family' : '🎓 For Students'}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-extrabold mb-4">{property.title}</h1>
              <div className="flex items-center gap-2 text-lg mb-6">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{property.location.area}, {property.location.city}</span>
              </div>

              <div className="flex gap-6 mb-6 pb-6 border-b">
                <div>👁️ {property.views || 0} views</div>
                <div>❤️ {property.likes?.length || 0} likes</div>
                <div className="text-sm text-gray-600">
                  Posted {new Date(property.createdAt).toLocaleDateString()}
                </div>
              </div>

              {property.type === 'property' && (
                <div className="mb-6 pb-6 border-b">
                  <h2 className="text-xl font-bold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Bed className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Bedrooms</p>
                          <p className="font-bold text-gray-900">{property.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Bath className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Bathrooms</p>
                          <p className="font-bold text-gray-900">{property.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <Maximize className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-sm text-gray-600">Area</p>
                          <p className="font-bold text-gray-900">{property.area} m²</p>
                        </div>
                      </div>
                    )}
                    {property.propertyType && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl">🏠</div>
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="font-bold text-gray-900 capitalize">{property.propertyType}</p>
                        </div>
                      </div>
                    )}
                    {property.furnished && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl">🛋️</div>
                        <div>
                          <p className="text-sm text-gray-600">Furnished</p>
                          <p className="font-bold text-gray-900">Yes</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <h2 className="text-xl font-bold mb-4">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity, index) => (
                      <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {property.preferences && (
                <div className="mb-6 pb-6 border-b">
                  <h2 className="text-xl font-bold mb-4">Preferences</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{property.preferences}</p>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <p className="whitespace-pre-wrap text-gray-700">{property.description}</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 sticky top-28">
              {property.price && (
                <div className="mb-6">
                  <div className="text-sm text-gray-600 mb-1">Monthly Rent</div>
                  <div className="text-4xl font-bold text-primary">
                    {property.price.toLocaleString()} <span className="text-lg text-gray-600">EGP</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {isOwner() ? (
                  <>
                    <Link href={`/properties/${property._id}/edit`} className="btn btn-primary w-full">
                      ✏️ Edit Property
                    </Link>
                    <button 
                      onClick={handleDelete} 
                      disabled={deleting} 
                      className="btn btn-outline w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      {deleting ? 'Deleting...' : '🗑️ Delete Property'}
                    </button>
                    
                    {/* Debug Info - Remove after testing */}
                    <div className="mt-4 p-3 bg-green-50 rounded text-xs">
                      <p className="font-semibold text-green-900">✅ You own this property</p>
                      <p className="text-green-700 mt-1">Your email: {session?.user?.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <a 
                      href={getWhatsAppLink()} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn bg-green-500 hover:bg-green-600 text-white w-full flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Contact via WhatsApp
                    </a>
                    
                    {/* Debug Info - Remove after testing */}
                    {session && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded text-xs">
                        <p className="font-semibold text-yellow-900">ℹ️ Not the owner</p>
                        <p className="text-yellow-700 mt-1">Your email: {session.user.email}</p>
                        <p className="text-yellow-700">Owner email: {property.userEmail}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Posted By */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Posted By</h3>
              <div className="flex items-center gap-3">
                {property.userImage ? (
                  <Image 
                    src={property.userImage} 
                    alt={property.userName} 
                    width={56} 
                    height={56} 
                    className="rounded-full" 
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {property.userName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="font-bold">{property.userName || 'Anonymous'}</div>
                  <div className="text-sm text-gray-600 capitalize">{property.userRole || 'user'}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Member since {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}