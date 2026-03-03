import Link from 'next/link'
import Image from 'next/image'
import type { Property } from '@/data/properties'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`}>
      <div className="card overflow-hidden cursor-pointer hover:-translate-y-2">
        {/* Image */}
        <div className="relative h-60 overflow-hidden">
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            className="object-cover"
          />
          {property.verified && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              ✓ VERIFIED
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {property.title}
          </h3>
          
          <p className="text-gray-600 mb-4 flex items-center gap-2">
            <span>📍</span> {property.location}, {property.city}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {property.bedrooms > 0 && (
              <span>🛏️ {property.bedrooms} Bed</span>
            )}
            <span>🚿 {property.bathrooms} Bath</span>
            <span>📐 {property.size}m²</span>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {property.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="text-xs bg-bg-light text-primary px-3 py-1 rounded-full font-medium">
                {feature}
              </span>
            ))}
          </div>

          <div className="flex items-end justify-between pt-4 border-t border-gray-100">
            <div>
              <div className="text-3xl font-extrabold text-primary">
                {property.price.toLocaleString()} EGP
              </div>
              <div className="text-sm text-gray-500">/month</div>
            </div>
            
            <div className="flex gap-2">
              <button className="btn btn-primary text-sm">
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
