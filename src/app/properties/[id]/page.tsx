'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { properties } from '@/data/properties'
import { 
  ArrowLeft, MapPin, Bed, Bath, Maximize, Calendar, 
  Phone, Mail, Eye, Heart, Share2, CheckCircle, 
  Clock, Home, Shield, ChevronLeft, ChevronRight,
  Building, Car, Wifi, Zap, Wind, Droplets
} from 'lucide-react'

export default function PropertyDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const property = properties.find(p => p.id === id)
  
  const [currentImage, setCurrentImage] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center pt-20">Loading...</div>
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Link href="/properties" className="text-primary hover:underline">
            ← Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const timeAgo = (dateString: string) => {
    const now = new Date()
    const posted = new Date(dateString)
    const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return formatDate(dateString)
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Top Navigation */}
      <div className="bg-white border-b sticky top-20 z-10">
        <div className="container mx-auto px-6 py-3">
          <Link 
            href="/properties" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to search results</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="relative bg-black rounded-lg overflow-hidden mb-4" style={{ height: '500px' }}>
              <img
                src={property.images[currentImage]}
                alt={property.title}
                className="w-full h-full object-contain"
              />
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                {currentImage + 1} / {property.images.length}
              </div>

              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                  >
                    <ChevronLeft size={24} className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                  >
                    <ChevronRight size={24} className="text-gray-800" />
                  </button>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all">
                  <Heart size={20} className="text-gray-700" />
                </button>
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all">
                  <Share2 size={20} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-6 gap-2 mb-6">
              {property.images.slice(0, 6).map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentImage === index 
                      ? 'border-primary scale-95' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Property Title & Price */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">{property.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin size={18} className="text-primary" />
                    <span className="font-medium">{property.area}, {property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {property.price.toLocaleString()} EGP
                  </div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Bed size={24} className="text-gray-400 mx-auto mb-2" />
                  <div className="font-bold text-gray-900">{property.bedrooms}</div>
                  <div className="text-xs text-gray-500">Bedrooms</div>
                </div>
                <div className="text-center">
                  <Bath size={24} className="text-gray-400 mx-auto mb-2" />
                  <div className="font-bold text-gray-900">{property.bathrooms}</div>
                  <div className="text-xs text-gray-500">Bathrooms</div>
                </div>
                <div className="text-center">
                  <Maximize size={24} className="text-gray-400 mx-auto mb-2" />
                  <div className="font-bold text-gray-900">{property.size}</div>
                  <div className="text-xs text-gray-500">sqm</div>
                </div>
                <div className="text-center">
                  <Home size={24} className="text-gray-400 mx-auto mb-2" />
                  <div className="font-bold text-gray-900 capitalize text-sm">{property.type}</div>
                  <div className="text-xs text-gray-500">Type</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Property Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-gray-900 capitalize">{property.type}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Bedrooms</span>
                  <span className="font-semibold text-gray-900">{property.bedrooms}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Bathrooms</span>
                  <span className="font-semibold text-gray-900">{property.bathrooms}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Size</span>
                  <span className="font-semibold text-gray-900">{property.size} sqm</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Furnished</span>
                  <span className="font-semibold text-gray-900">{property.furnished ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span className="text-gray-600">Available From</span>
                  <span className="font-semibold text-gray-900">{formatDate(property.availableFrom)}</span>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Posted Info */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Posted {timeAgo(property.postedDate)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Eye size={16} />
                    <span>{property.views} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={16} />
                    <span>{property.saved} saved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              {/* Agent Card */}
              <div className="bg-white border rounded-lg p-6 mb-4">
                <div className="text-center mb-4">
                  <img
                    src={property.owner.image}
                    alt={property.owner.name}
                    className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-gray-200"
                  />
                  <h3 className="font-bold text-lg text-gray-900">{property.owner.name}</h3>
                  {property.owner.verified && (
                    <div className="inline-flex items-center gap-1 text-green-600 text-sm mt-1">
                      <CheckCircle size={14} />
                      <span>Verified</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <a
                    href={`tel:${property.owner.phone}`}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone size={18} />
                    <span>Call</span>
                  </a>

                  <a
                    href={`mailto:${property.owner.email}`}
                    className="w-full bg-white border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail size={18} />
                    <span>Email</span>
                  </a>

                  <a
                    href={`https://wa.me/${property.owner.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone size={18} />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Report */}
              <button className="w-full text-center text-sm text-gray-600 hover:text-primary py-2 transition-colors">
                Report this property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}