'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface Property {
  _id: string
  title: string
  location: {
    city: string
    area: string
  }
  price: number
  images: Array<{ url: string }>
  deletedAt: string
  permanentDeleteAt: string
}

export default function DeletedPropertiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user) {
      fetchDeletedProperties()
    }
  }, [session, status, router])

  const fetchDeletedProperties = async () => {
    try {
      setLoading(true)
      const userId = (session?.user as any)?.id

      const response = await fetch(`${API_URL}/api/properties/user/${userId}/deleted`, {
        cache: 'no-store'
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setProperties(data.properties)
      } else {
        throw new Error(data.message || 'Failed to fetch deleted properties')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (propertyId: string) => {
    if (!confirm('Are you sure you want to restore this property?')) return

    try {
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/restore`, {
        method: 'POST'
      })

      const data = await response.json()

      if (data.success) {
        alert('Property restored successfully!')
        fetchDeletedProperties()
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore property')
    }
  }

  const getRemainingDays = (permanentDeleteAt: string) => {
    const now = new Date()
    const deleteDate = new Date(permanentDeleteAt)
    const diffTime = deleteDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary-dark mb-4 font-semibold"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Deleted Properties 🗑️
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your deleted properties. They will be permanently removed in 2 days.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No deleted properties</h3>
            <p className="text-gray-600">You have no properties in trash</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => {
              const remainingDays = getRemainingDays(property.permanentDeleteAt)

              return (
                <div
                  key={property._id}
                  className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-6"
                >
                  {/* Image */}
                  <div className="w-32 h-32 flex-shrink-0">
                    {property.images && property.images.length > 0 ? (
                      <Image
                        src={property.images[0].url}
                        alt={property.title}
                        width={128}
                        height={128}
                        className="rounded-xl object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center text-4xl">
                        🏠
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{property.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      📍 {property.location.area}, {property.location.city}
                    </p>
                    <p className="text-primary font-bold">
                      {property.price.toLocaleString()} EGP/month
                    </p>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold mb-2">
                      ⏰ {remainingDays} day{remainingDays !== 1 ? 's' : ''} left
                    </div>
                    <p className="text-xs text-gray-500">
                      Deleted: {new Date(property.deletedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(property._id)}
                      className="btn btn-primary"
                    >
                      ♻️ Restore
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}