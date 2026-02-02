'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    university: '',
    bio: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (session?.user) {
      loadUserData()
    }
  }, [session, status, router])

  const loadUserData = async () => {
    try {
      const email = session?.user?.email
      const userId = (session?.user as any)?.id

      console.log('📥 Loading user data for:', { email, userId })

      if (!email) {
        console.error('❌ No email found in session')
        return
      }

      // Try to fetch from backend with both email and id
      const queryParams = new URLSearchParams()
      if (email) queryParams.append('email', email)
      if (userId) queryParams.append('id', userId)

      const response = await fetch(`${API_URL}/api/auth/profile?${queryParams.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      console.log('📡 Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ User data loaded:', data.user)

        if (data.success && data.user) {
          setFormData({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            location: data.user.location || '',
            university: data.user.university || '',
            bio: data.user.bio || ''
          })
          setImagePreview(data.user.avatar || session.user.image || '')
        }
      } else {
        console.error('❌ Failed to load user data:', response.status)
        // Fallback to session data
        setFormData({
          name: session.user.name || '',
          email: session.user.email || '',
          phone: (session.user as any)?.phone || '',
          location: (session.user as any)?.location || '',
          university: (session.user as any)?.university || '',
          bio: (session.user as any)?.bio || ''
        })
        setImagePreview(session.user.image || '')
      }
    } catch (error) {
      console.error('❌ Load user data error:', error)
      // Fallback to session data
      setFormData({
        name: session?.user?.name || '',
        email: session?.user?.email || '',
        phone: (session?.user as any)?.phone || '',
        location: (session?.user as any)?.location || '',
        university: (session?.user as any)?.university || '',
        bio: (session?.user as any)?.bio || ''
      })
      setImagePreview(session?.user?.image || '')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      let avatarUrl = imagePreview

      // Upload image if changed
     if (imageFile) {
  console.log('📤 Uploading image...')
  
  const uploadFormData = new FormData()
  uploadFormData.append('file', imageFile) // Changed from 'image' to 'file'

  const uploadResponse = await fetch(`${API_URL}/api/upload`, { // Changed from '/api/upload'
    method: 'POST',
    body: uploadFormData
  })

  const uploadData = await uploadResponse.json()
  console.log('📥 Upload response:', uploadData)

  if (uploadResponse.ok && uploadData.success) {
    avatarUrl = uploadData.url
    console.log('✅ Image uploaded:', avatarUrl)
  } else {
    throw new Error(uploadData.message || 'Image upload failed')
  }
}

      // Update profile
      console.log('📤 Updating profile for:', formData.email)

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          university: formData.university,
          bio: formData.bio,
          avatar: avatarUrl
        })
      })

      const data = await response.json()

      console.log('📡 Update response:', data)

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile')
      }

      // Update NextAuth session
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.user.name,
          image: data.user.avatar
        }
      })

      // Store in localStorage for immediate UI update
      localStorage.setItem('profile_updated', 'true')
      localStorage.setItem('updated_name', data.user.name)
      localStorage.setItem('updated_image', data.user.avatar)

      setSuccess('Profile updated successfully!')

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        const userRole = (session?.user as any)?.role || 'student'
        const userId = (session?.user as any)?.id || session?.user?.email?.split('@')[0]
        router.push(`/dashboard/${userRole}/${userId}`)
      }, 1000)

    } catch (err: any) {
      console.error('❌ Submit error:', err)
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
    return null
  }

  const userRole = (session.user as any)?.role || 'student'

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-28">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Profile Settings ⚙️
          </h1>
          <p className="text-gray-600 text-lg">
            Update your personal information
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full object-cover w-30 h-30"
                />
              ) : (
                <div className="w-30 h-30 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                  {formData.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
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
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary-dark"
              >
                📷
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">Click camera to change</p>
          </div>

          {/* Name */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
              disabled={loading}
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              className="input bg-gray-100"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Phone</label>
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
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              placeholder="e.g., Cairo, Egypt"
              disabled={loading}
            />
          </div>

          {/* University (for students) */}
          {userRole === 'student' && (
            <div>
              <label className="block mb-2 font-semibold text-gray-700">University</label>
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

          {/* Bio */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? 'Updating...' : '✅ Save Changes'}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to logout?')) {
                  signOut({ callbackUrl: '/login' })
                }
              }}
              className="btn bg-red-500 hover:bg-red-600 text-white w-full"
            >
              🚪 Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}