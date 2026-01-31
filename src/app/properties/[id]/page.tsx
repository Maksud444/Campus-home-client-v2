'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Property {
  _id: string
  userId: string
  userEmail: string
  userName: string
  userImage: string
  userRole: string
  title: string
  description: string
  type: string
  price: number | null
  location: string
  whatsappNumber?: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  amenities: string[]
  images: string[]
  videos: string[]
  propertyType: string
  furnished: boolean
  likes: any[]
  views: number
  status: string
  createdAt: string
  updatedAt: string
  targetAudience?: string
  preferences?: string
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
      const response = await fetch(`https://student-housing-backend.vercel.app/api/properties/${propertyId}`)
      const data = await response.json()

      if (data.success) {
        setProperty(data.property)
      } else {
        alert('Property not found')
        router.push('/properties')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  async function handleLike() {
    if (!session) {
      alert('Please login to like properties')
      return
    }

    try {
      const response = await fetch(`https://student-housing-backend.vercel.app/api/properties/${propertyId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: (session?.user as any)?._id || session.user.email?.split('@')[0],
          userName: session.user?.name || 'Anonymous'
        })
      })

      const data = await response.json()

      if (data.success) {
        setProperty(prev => prev ? { ...prev, likes: data.property.likes } : null)
      }
    } catch (error) {
      console.error('Error liking property:', error)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this property?')) return

    try {
      setDeleting(true)
      const response = await fetch(`https://student-housing-backend.vercel.app/api/properties/${propertyId}`, {
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
      console.error('Error deleting property:', error)
      alert('Failed to delete property')
    } finally {
      setDeleting(false)
    }
  }

  function getWhatsAppLink() {
    if (!property) return '#'
    
    const phoneNumber = property.whatsappNumber?.replace(/\D/g, '') || ''
    const message = `Hi! I'm interested in your property:\n\n*${property.title}*\n\n📍 Location: ${property.location}\n💰 Price: ${property.price ? property.price.toLocaleString() + ' EGP/mo' : 'Negotiable'}\n\nView here: ${typeof window !== 'undefined' ? window.location.href : ''}`

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
  }

  function isLiked() {
    if (!session?.user || !property) return false
    const userId = (session.user as any)._id || session.user.email?.split('@')[0]
    return property.likes?.some((like: any) => like.userId === userId) || false
  }

  function isOwner() {
    if (!session?.user || !property) return false
    return session.user.email === property.userEmail
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-6xl mx-auto px-4">
        <Link 
          href="/properties"
          className="flex items-center gap-2 text-primary hover:text-primary-dark mb-6 font-semibold"
        >
          ← Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-md mb-6">
              {property.images && property.images.length > 0 ? (
                <div>
                  <div className="relative h-96 bg-gray-200">
                    <Image
                      src={property.images[currentImageIndex]}
                      alt={property.title || 'Property'}
                      fill
                      className="object-cover"
                    />
                    
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images.length - 1 : prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                        >
                          ←
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex(prev => prev === property.images.length - 1 ? 0 : prev + 1)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                        >
                          →
                        </button>
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {property.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {property.images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {property.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${currentImageIndex === index ? 'ring-2 ring-primary' : ''}`}
                        >
                          <Image src={image} alt="Thumbnail" fill className="object-cover" />
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

              <h1 className="text-3xl font-extrabold mb-4">{property.title || 'Untitled Property'}</h1>
              <p className="text-lg mb-6">📍 {property.location || 'Location not specified'}</p>

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
                    {property.bedrooms && <div className="bg-gray-50 p-4 rounded-xl">🛏️ {property.bedrooms} BD</div>}
                    {property.bathrooms && <div className="bg-gray-50 p-4 rounded-xl">🚿 {property.bathrooms} BA</div>}
                    {property.area && <div className="bg-gray-50 p-4 rounded-xl">📐 {property.area} sqm</div>}
                    {property.propertyType && <div className="bg-gray-50 p-4 rounded-xl">🏠 {property.propertyType}</div>}
                    {property.furnished && <div className="bg-gray-50 p-4 rounded-xl">🛋️ Furnished</div>}
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
                <p className="whitespace-pre-wrap text-gray-700">{property.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Contact Card */}
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
                    <Link href={`/properties/${property._id}/edit`} className="btn btn-primary w-full">✏️ Edit</Link>
                    <button onClick={handleDelete} disabled={deleting} className="btn btn-outline w-full text-red-600 border-red-600">
                      {deleting ? 'Deleting...' : '🗑️ Delete'}
                    </button>

                    <div className="mt-6 p-4 bg-primary/5 rounded-xl">
                      <h3 className="font-bold text-sm mb-3">Your Post Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Views:</span>
                          <span className="font-bold">{property.views || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Likes:</span>
                          <span className="font-bold">{property.likes?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {property.likes && property.likes.length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-bold text-sm mb-3">People who liked ({property.likes.length})</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {property.likes.map((like: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {like.userImage ? (
                                <Image src={like.userImage} alt={like.userName || 'User'} width={24} height={24} className="rounded-full" />
                              ) : (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs">
                                  {like.userName?.charAt(0) || 'U'}
                                </div>
                              )}
                              <span>{like.userName || 'Anonymous'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={handleLike} className={`btn w-full ${isLiked() ? 'bg-red-500 text-white' : 'btn-outline'}`}>
                      {isLiked() ? '❤️ Liked' : '🤍 Like'}
                    </button>
                    <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="btn bg-green-500 hover:bg-green-600 text-white w-full flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Contact on WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Posted By Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Posted By</h3>
              <div className="flex items-center gap-3">
                {property.userImage ? (
                  <Image 
                    src={property.userImage} 
                    alt={property.userName || 'User'} 
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