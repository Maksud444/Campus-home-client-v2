'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SettingsPage() {
  const { data: session, update, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    bio: '',
    location: '',
    profileImage: ''
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  // Load user data from session
  useEffect(() => {
    if (session?.user) {
      console.log('👤 Current session:', session.user)
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: (session.user as any).phone || '',
        university: (session.user as any).university || '',
        bio: (session.user as any).bio || '',
        location: (session.user as any).location || '',
        profileImage: session.user.image || ''
      })
      setImagePreview(session.user.image || '')
    }
  }, [session])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

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

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('image', imageFile)

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'
      const token = (session as any)?.accessToken

      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Image upload failed')
      }

      console.log('✅ Image uploaded:', data.url)
      return data.url
    } catch (err: any) {
      console.error('❌ Image upload error:', err)
      throw new Error(err.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('💾 Updating profile...')

      let profileImageUrl = formData.profileImage

      // Upload new image if selected
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          profileImageUrl = uploadedUrl
        }
      }

      // Update profile via backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'
      const token = (session as any)?.accessToken

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          university: formData.university,
          bio: formData.bio,
          location: formData.location,
          avatar: profileImageUrl
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Update failed')
      }

      console.log('✅ Profile updated in backend:', data.user)

      // CRITICAL: Update NextAuth session with trigger
      console.log('🔄 Updating NextAuth session...')
      
      const updatedSession = await update({
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

      console.log('✅ Session updated:', updatedSession)

      setSuccess('✅ Profile updated successfully!')
      setImageFile(null)

      // Small delay to show success message
      setTimeout(() => {
        console.log('🔄 Refreshing page...')
        router.refresh()
      }, 1500)

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

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
          {/* Profile Image */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Profile Picture
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-full object-cover border-4 border-gray-200"
                    key={imagePreview} // Force re-render on change
                  />
                ) : (
                  <div className="w-30 h-30 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                    {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  </div>
                )}
              </div>

              <div>
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading || uploading}
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg cursor-pointer transition-colors"
                >
                  📷 Change Photo
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Your full name"
                required
                disabled={loading}
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                className="input bg-gray-100 cursor-not-allowed"
                disabled
              />
              <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type
              </label>
              <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-semibold text-blue-900 capitalize">
                  {(session.user as any)?.role || 'User'}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
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

            {/* University */}
            {(session.user as any)?.role === 'student' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  University
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="input"
                  placeholder="e.g., Cairo University"
                  disabled={loading}
                />
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input"
                placeholder="e.g., Nasr City, Cairo"
                disabled={loading}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="input resize-none"
                placeholder="Tell us about yourself..."
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                '💾 Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}