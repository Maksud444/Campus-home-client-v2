'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { properties, locations, propertyTypes } from '@/data/properties'
import { Search, SlidersHorizontal, MapPin, Bed, Bath, Maximize, X } from 'lucide-react'

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const locationParam = searchParams.get('location')

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>(locationParam || 'all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [bedrooms, setBedrooms] = useState<string>('all')
  const [furnished, setFurnished] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Update selected location when URL param changes
  useEffect(() => {
    if (locationParam) {
      // Convert slug to location name
      const locationName = locationParam
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      setSelectedLocation(locationName)
    }
  }, [locationParam])

  const filteredProperties = properties.filter(property => {
    if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !property.location.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !property.area.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    if (selectedLocation !== 'all' && property.location !== selectedLocation) {
      return false
    }

    if (selectedType !== 'all' && property.type !== selectedType) {
      return false
    }

    if (minPrice && property.price < parseInt(minPrice)) {
      return false
    }
    if (maxPrice && property.price > parseInt(maxPrice)) {
      return false
    }

    if (bedrooms !== 'all' && property.bedrooms !== parseInt(bedrooms)) {
      return false
    }

    if (furnished !== 'all' && property.furnished !== (furnished === 'yes')) {
      return false
    }

    return true
  })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedLocation('all')
    setSelectedType('all')
    setMinPrice('')
    setMaxPrice('')
    setBedrooms('all')
    setFurnished('all')
  }

  const activeFiltersCount = [
    selectedLocation !== 'all',
    selectedType !== 'all',
    minPrice !== '',
    maxPrice !== '',
    bedrooms !== 'all',
    furnished !== 'all'
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-12">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">
            {selectedLocation !== 'all' ? `Properties in ${selectedLocation}` : 'Browse Properties'}
          </h1>
          <p className="text-xl text-white/90">
            {selectedLocation !== 'all' 
              ? `Showing ${filteredProperties.length} properties in ${selectedLocation}`
              : 'Find your perfect student accommodation'
            }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by title, location, or area..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center justify-center gap-2 relative"
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white w-6 h-6 rounded-full text-sm flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  <option value="Nasr City">Nasr City</option>
                  <option value="Maadi">Maadi</option>
                  <option value="Heliopolis">Heliopolis</option>
                  <option value="New Cairo">New Cairo</option>
                  <option value="Giza">Giza</option>
                  <option value="Zamalek">Zamalek</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                >
                  <option value="all">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3 Bedrooms</option>
                  <option value="4">4+ Bedrooms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price (EGP)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price (EGP)</label>
                <input
                  type="number"
                  placeholder="Any"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Furnished</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={furnished}
                  onChange={(e) => setFurnished(e.target.value)}
                >
                  <option value="all">Any</option>
                  <option value="yes">Furnished</option>
                  <option value="no">Unfurnished</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full btn btn-outline flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredProperties.length} Properties Found
          </h2>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
            <option>Sort by: Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Viewed</option>
          </select>
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-primary"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {property.verified && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ Verified
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-primary text-white px-4 py-1 rounded-full font-bold">
                    {property.price} EGP/mo
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-sm">{property.area}, {property.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Bed size={16} />
                      <span className="text-sm">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath size={16} />
                      <span className="text-sm">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Maximize size={16} />
                      <span className="text-sm">{property.size} sqm</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs capitalize">
                      {property.type}
                    </span>
                    {property.furnished && (
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                        Furnished
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {selectedLocation !== 'all' 
                ? `No properties available in ${selectedLocation} matching your criteria`
                : 'Try adjusting your filters'
              }
            </p>
            <button onClick={clearFilters} className="btn btn-primary">
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}