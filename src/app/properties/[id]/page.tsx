'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize, Phone, Share2, Heart, Eye, Calendar, User, Home, Shield, Star, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import dynamic from 'next/dynamic'

const MapPage = dynamic(() => import('../map/page'), { ssr: false })

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
  const { t } = useLanguage()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [showFullGallery, setShowFullGallery] = useState(false)
  const [viewsCount, setViewsCount] = useState(0)
  const [likesCount, setLikesCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  useEffect(() => {
    if (propertyId && propertyId !== 'map') {
      fetchProperty()
    }
  }, [propertyId])

  async function fetchProperty() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`)
      const data = await response.json()

      if (data.success && data.property) {
        setProperty(data.property)

        // Initialize counts from backend data, optimistically include this visit
        const currentViews = data.property.views || 0
        const currentLikes = (data.property.likes || []) as string[]
        setViewsCount(currentViews + 1)
        setLikesCount(currentLikes.length)

        // Persist view increment to the backend database (fire-and-forget)
        fetch(`${API_URL}/api/properties/${propertyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ views: currentViews + 1 }),
        }).catch(() => {})
      } else {
        router.push('/properties')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      router.push('/properties')
    } finally {
      setLoading(false)
    }
  }

  // Initialise liked state from backend property data once both property and session are available
  useEffect(() => {
    if (!property || !session?.user) return
    const userKey = session.user.email || (session.user as any)?.id || session.user.name
    if (!userKey) return
    const likes = (property.likes || []) as string[]
    setLiked(likes.includes(userKey))
  }, [property, session])

  async function handleLike() {
    if (!session?.user) { router.push('/login'); return }
    if (likeLoading) return
    setLikeLoading(true)
    const userKey = session.user.email || (session.user as any)?.id || session.user.name
    if (!userKey) { setLikeLoading(false); return }

    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1))

    // Build the updated likes array and persist to the backend database
    const currentLikes = ((property?.likes || []) as string[]).filter(Boolean)
    const newLikes = newLiked
      ? [...currentLikes.filter(l => l !== userKey), userKey]
      : currentLikes.filter(l => l !== userKey)

    try {
      // Dual-write: backend (primary) + local stats (fallback for dashboard)
      await Promise.allSettled([
        fetch(`${API_URL}/api/properties/${propertyId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ likes: newLikes }),
        }),
        fetch(`/api/property-stats/${propertyId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'like', userEmail: userKey }),
        }),
      ])
    } catch {
      // Keep optimistic update on network error
    } finally {
      // Always sync property.likes with newLikes so the [property, session]
      // useEffect reflects the correct liked state and doesn't revert the click
      setProperty(prev => prev ? { ...prev, likes: newLikes } : prev)
      setLikeLoading(false)
    }
  }

  function isOwner() {
    if (!session?.user || !property) return false
    const emailMatch = session.user.email === property.userEmail
    const idMatch = (session.user as any)?.id === property.userId
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
      console.error('Error deleting property:', error)
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
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  // If routing incorrectly sent /properties/map here, render the map page
  if (propertyId === 'map') {
    return <MapPage />
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Skeleton */}
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-4 gap-2 mb-8">
              <div className="col-span-2 row-span-2 h-[400px] bg-gray-200 rounded-l-2xl"></div>
              <div className="h-[196px] bg-gray-200"></div>
              <div className="h-[196px] bg-gray-200 rounded-tr-2xl"></div>
              <div className="h-[196px] bg-gray-200"></div>
              <div className="h-[196px] bg-gray-200 rounded-br-2xl"></div>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="text-7xl mb-6">🏠</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">{t('detail.notFound')}</h2>
          <p className="text-gray-500 mb-6">{t('detail.notFoundDesc')}</p>
          <Link href="/properties" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
            <ChevronLeft className="w-5 h-5" />
            {t('detail.backToProperties')}
          </Link>
        </div>
      </div>
    )
  }

  const images = property.images || []
  const imageUrls = images.map(img => typeof img === 'string' ? img : img.url)

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'property': return t('propertiesPage.propertyType')
      case 'room': return t('propertiesPage.roomType')
      case 'roommate': return t('propertiesPage.roommateType')
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'property': return 'bg-blue-500'
      case 'room': return 'bg-purple-500'
      case 'roommate': return 'bg-emerald-500'
      default: return 'bg-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Screen Gallery Modal */}
      {showFullGallery && (
        <div className="fixed inset-0 z-50 bg-black">
          <button
            onClick={() => setShowFullGallery(false)}
            className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
            {currentImageIndex + 1} / {imageUrls.length}
          </div>

          <div className="h-full flex items-center justify-center p-4">
            {imageUrls.length > 0 && (
              <div className="relative w-full h-full max-w-5xl">
                <Image
                  src={imageUrls[currentImageIndex]}
                  alt={property.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {imageUrls.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === 0 ? imageUrls.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => prev === imageUrls.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Thumbnail Strip */}
          {imageUrls.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
              {imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    currentImageIndex === index ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b pt-20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">{t('detail.home')}</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-primary transition-colors">{t('detail.properties')}</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{property.title}</span>
          </nav>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white pb-2">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {imageUrls.length > 0 ? (
            <div className="relative">

              {/* ── MOBILE: proper image slider ── */}
              <div className="sm:hidden relative rounded-2xl overflow-hidden" style={{ height: '260px' }}>
                <Image
                  src={imageUrls[currentImageIndex]}
                  alt={property.title}
                  fill
                  className="object-cover transition-all duration-300"
                  priority
                />
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? imageUrls.length - 1 : prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === imageUrls.length - 1 ? 0 : prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium z-10">
                      {currentImageIndex + 1} / {imageUrls.length}
                    </div>
                    <button
                      onClick={() => setShowFullGallery(true)}
                      className="absolute bottom-3 right-3 bg-white/90 text-gray-900 px-3 py-1.5 rounded-lg font-semibold text-xs shadow-lg flex items-center gap-1.5 z-10"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      {t('detail.viewAllPhotos')} ({imageUrls.length})
                    </button>
                    {/* Dot indicators */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {imageUrls.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImageIndex(i)}
                          className={`rounded-full transition-all ${i === currentImageIndex ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* ── DESKTOP: Grid gallery ── */}
              <div className={`hidden sm:grid gap-2 rounded-2xl overflow-hidden ${
                imageUrls.length === 1 ? 'grid-cols-1' :
                imageUrls.length === 2 ? 'grid-cols-2' :
                'grid-cols-4 grid-rows-2'
              }`} style={{ height: imageUrls.length === 1 ? '450px' : '400px' }}>
                {/* Main Image */}
                <div
                  className={`relative cursor-pointer group ${
                    imageUrls.length >= 3 ? 'col-span-2 row-span-2' : ''
                  }`}
                  onClick={() => { setCurrentImageIndex(0); setShowFullGallery(true) }}
                >
                  <Image
                    src={imageUrls[0]}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:brightness-90 transition-all"
                  />
                </div>

                {/* Secondary Images */}
                {imageUrls.slice(1, 5).map((url, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group"
                    onClick={() => { setCurrentImageIndex(index + 1); setShowFullGallery(true) }}
                  >
                    <Image
                      src={url}
                      alt={`${property.title} ${index + 2}`}
                      fill
                      className="object-cover group-hover:brightness-90 transition-all"
                    />
                    {index === 3 && imageUrls.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">+{imageUrls.length - 5} {t('propertiesPage.more')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* View All Photos Button — desktop only */}
              {imageUrls.length > 1 && (
                <button
                  onClick={() => { setCurrentImageIndex(0); setShowFullGallery(true) }}
                  className="hidden sm:flex absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg font-semibold text-sm shadow-lg items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  {t('detail.viewAllPhotos')} ({imageUrls.length})
                </button>
              )}

            </div>
          ) : (
            <div className="h-[400px] rounded-2xl flex items-center justify-center bg-gray-100 text-8xl">
              🏠
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & Price Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {/* Type Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`${getTypeColor(property.type)} text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide`}>
                  {getTypeLabel(property.type)}
                </span>
                {property.propertyType && property.propertyType !== property.type && (
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {property.propertyType}
                  </span>
                )}
                {property.targetAudience && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    property.targetAudience === 'family'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {property.targetAudience === 'family' ? t('detail.forFamily') : t('detail.forStudents')}
                  </span>
                )}
                {property.furnished && (
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    {t('detail.furnished')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {property.title}
              </h1>

              {/* Location — click opens Google Maps */}
              <a
                href={
                  (property.location as any).coordinates?.lat
                    ? `https://www.google.com/maps/search/?api=1&query=${(property.location as any).coordinates.lat},${(property.location as any).coordinates.lng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.location.area} ${property.location.city} Egypt`)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 group w-fit"
                title="Open in Google Maps"
              >
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm sm:text-base group-hover:underline">
                  {property.location.area}, {property.location.city}
                  {property.location.address && ` - ${property.location.address}`}
                </span>
                <svg className="w-3 h-3 text-gray-400 group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Price */}
              {property.price && (
                <div className="flex items-baseline gap-2 mb-4 pb-4 border-b">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary">
                    {property.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 font-medium text-lg">EGP / {t('properties.month')}</span>
                </div>
              )}

              {/* Quick Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{viewsCount} {t('propertiesPage.views')}</span>
                </div>
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  title={liked ? 'Unlike' : 'Like'}
                  className={`flex items-center gap-1.5 transition-colors disabled:opacity-60 ${
                    liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-current scale-110' : ''}`} />
                  <span>{likesCount} {t('propertiesPage.likes')}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(property.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <Share2 className="w-4 h-4" />
                  {t('detail.share')}
                </button>
              </div>
            </div>

            {/* Property Details Grid */}
            {property.type === 'property' && (property.bedrooms || property.bathrooms || property.area || property.propertyType) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  {t('detail.propertyDetails')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {property.propertyType && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Home className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">{t('detail.type')}</p>
                      <p className="font-bold text-gray-900 capitalize">{property.propertyType}</p>
                    </div>
                  )}
                  {property.bedrooms !== undefined && property.bedrooms !== null && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bed className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">{t('properties.bedrooms')}</p>
                      <p className="font-bold text-gray-900">{property.bedrooms}</p>
                    </div>
                  )}
                  {property.bathrooms !== undefined && property.bathrooms !== null && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Bath className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">{t('properties.bathrooms')}</p>
                      <p className="font-bold text-gray-900">{property.bathrooms}</p>
                    </div>
                  )}
                  {property.area !== undefined && property.area !== null && (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Maximize className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium mb-0.5">{t('properties.area')}</p>
                      <p className="font-bold text-gray-900">{property.area} m²</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('detail.description')}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {t('detail.amenities')}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            {property.preferences && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('detail.preferences')}</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.preferences}</p>
              </div>
            )}

            {/* Videos */}
            {property.videos && property.videos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('detail.videos')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.videos.map((video, index) => (
                    <video key={index} src={video} controls className="w-full rounded-xl" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {isOwner() ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="font-semibold text-gray-900">{t('detail.yourProperty')}</p>
                      <p className="text-sm text-gray-500">{t('detail.manageProperty')}</p>
                    </div>
                    <div className="space-y-3">
                      <Link
                        href={`/properties/${property._id}/edit`}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t('detail.editProperty')}
                      </Link>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-3 rounded-xl font-semibold transition-colors"
                      >
                        {deleting ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        {deleting ? t('detail.deleting') : t('detail.deleteProperty')}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Price in sidebar for mobile */}
                    {property.price && (
                      <div className="text-center mb-4 pb-4 border-b">
                        <p className="text-sm text-gray-500 mb-1">{t('detail.monthlyRent')}</p>
                        <div className="text-3xl font-extrabold text-primary">
                          {property.price.toLocaleString()} <span className="text-base text-gray-500 font-medium">EGP</span>
                        </div>
                      </div>
                    )}
                    <a
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1fb855] text-white px-4 py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg shadow-green-200"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {t('detail.contactWhatsapp')}
                    </a>
                    <p className="text-center text-xs text-gray-400 mt-2">
                      {t('detail.directMessage')}
                    </p>
                  </>
                )}
              </div>

              {/* Agent/Owner Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">{t('detail.postedBy')}</h3>
                <div className="flex items-center gap-4">
                  {property.userImage ? (
                    <Image
                      src={property.userImage}
                      alt={property.userName}
                      width={56}
                      height={56}
                      className="rounded-full ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-100">
                      {property.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{property.userName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500 capitalize flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {property.userRole || 'user'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {t('detail.memberSince')} {new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <h3 className="font-bold text-amber-800 mb-3 text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('detail.safetyTips')}
                </h3>
                <ul className="space-y-2 text-xs text-amber-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{t('detail.safetyTip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{t('detail.safetyTip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">•</span>
                    <span>{t('detail.safetyTip3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
