'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signOut } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    location: '',
    bio: '',
    profileImage: ''
  })

  // Load fresh data from backend on mount
 useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      loadUserProfile()
    }
  }, [status, session?.user?.email, refreshKey])

  const loadUserProfile = async () => {
    try {
      console.log('📡 Loading fresh profile data...')
      
      const token = (session as any)?.accessToken
      const response = await fetch(`${API_URL}/api/auth/profile?email=${session?.user?.email}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })

      const data = await response.json()

      if (data.success && data.user) {
        console.log('✅ Loaded profile:', data.user)
        
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          university: data.user.university || '',
          location: data.user.location || '',
          bio: data.user.bio || '',
          profileImage: data.user.avatar || session?.user?.image || ''
        })
        setImagePreview(data.user.avatar || session?.user?.image || '')
      } else {
        // Fallback to session data
        setFormData({
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          phone: (session?.user as any)?.phone || '',
          university: (session?.user as any)?.university || '',
          location: (session?.user as any)?.location || '',
          bio: (session?.user as any)?.bio || '',
          profileImage: session?.user?.image || ''
        })
        setImagePreview(session?.user?.image || '')
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error)
      // Use session data as fallback
      setFormData({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: (session?.user as any)?.phone || '',
        university: (session?.user as any)?.university || '',
        location: (session?.user as any)?.location || '',
        bio: (session?.user as any)?.bio || '',
        profileImage: session?.user?.image || ''
      })
      setImagePreview(session?.user?.image || '')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    try {
      console.log('📤 Uploading image...')
      const uploadFormData = new FormData()
      uploadFormData.append('image', imageFile)

      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: uploadFormData
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed')
      }

      console.log('✅ Image uploaded:', data.url)
      return data.url
    } catch (err: any) {
      console.error('❌ Upload error:', err)
      throw new Error(err.message || 'Failed to upload image')
    }
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  setSuccess('')

  try {
    console.log('💾 Starting profile update...')

    let profileImageUrl = formData.profileImage

    if (imageFile) {
      profileImageUrl = await uploadImage() || profileImageUrl
    }

    const updateData = {
      email: formData.email,
      name: formData.name,
      phone: formData.phone,
      university: formData.university,
      bio: formData.bio,
      location: formData.location,
      avatar: profileImageUrl
    }

    const token = (session as any)?.accessToken
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(updateData)
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Update failed')
    }

    console.log('✅ Backend updated')

    // Update session
    await update({
      user: {
        ...session?.user,
        name: data.user.name,
        image: data.user.avatar,
        phone: data.user.phone,
        university: data.user.university,
        bio: data.user.bio,
        location: data.user.location
      }
    })

    console.log('✅ Session updated')
    setSuccess('✅ Profile updated successfully! Redirecting...')
    setImageFile(null)

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 800))

    console.log('🔄 Redirecting to dashboard...')
    
    // Redirect to dashboard (this will trigger navbar refresh)
    router.push('/dashboard?updated=' + Date.now())

  } catch (err: any) {
    console.error('❌ Update error:', err)
    setError(err.message || 'Failed to update profile')
  } finally {
    setLoading(false)
  }
}

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Profile Settings</h1>

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
          {/* Profile Image */}
          <div className="mb-8 flex items-center gap-6">
            <div className="relative">
              <Image
                src={imagePreview || 'https://via.placeholder.com/150'}
                alt="Profile"
                width={120}
                height={120}
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label
                htmlFor="image-upload"
                className={`btn btn-outline cursor-pointer inline-block ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                📷 Change Photo
              </label>
              <p className="text-sm text-gray-500 mt-2">Max size 5MB</p>
            </div>
          </div>

          {/* Full Name */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
              disabled={loading}
            />
          </div>

          {/* Email (Read-only) */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              className="input bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
              placeholder="+20 123 456 7890"
              disabled={loading}
            />
          </div>

          {/* Location */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              placeholder="Cairo, Egypt"
              disabled={loading}
            />
          </div>

          {/* University */}
          {(session?.user as any)?.role === 'student' && (
            <div className="mb-6">
              <label className="block mb-2 font-semibold text-gray-700">
                University
              </label>
              <input
                type="text"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                className="input"
                placeholder="Cairo University"
                disabled={loading}
              />
            </div>
          )}

          {/* Bio */}
          <div className="mb-8">
            <label className="block mb-2 font-semibold text-gray-700">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}