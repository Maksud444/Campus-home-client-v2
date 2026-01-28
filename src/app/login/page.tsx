'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ✅ FIXED: Always use backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export default function LoginPage() {
  const router = useRouter()
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [role, setRole] = useState<'student' | 'agent' | 'owner' | 'service-provider'>('student')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleGoogleSignIn = async () => {
    try {
      setError('')
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('Google sign in failed')
    }
  }

  const handleFacebookSignIn = async () => {
    try {
      setError('')
      await signIn('facebook', { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('Facebook sign in failed')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isSignup) {
        // ========== REGISTRATION - FIXED TO USE BACKEND ==========
        console.log('📝 Registering user:', {
          email: formData.email,
          role: role,
          API_URL: API_URL
        })

        // Validation
        if (!formData.name.trim()) {
          throw new Error('Please enter your name')
        }
        if (!formData.email.trim()) {
          throw new Error('Please enter your email')
        }
        if (!formData.password) {
          throw new Error('Please enter your password')
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }

        // ✅ FIXED: Call BACKEND register API (not local /api)
        console.log('🌐 Calling backend:', `${API_URL}/api/auth/register`)

        const registerRes = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            role: role
          })
        })

        const registerData = await registerRes.json()
        console.log('📥 Backend register response:', registerData)

        if (!registerRes.ok) {
          throw new Error(registerData.message || 'Registration failed')
        }

        console.log('✅ Registration successful!')
        setSuccess('Account created! Logging you in...')

        // Wait a bit for backend
        await new Promise(resolve => setTimeout(resolve, 1000))

        // ✅ FIXED: Now login with credentials using NextAuth
        console.log('🔐 Auto-login attempt...')
        const loginResult = await signIn('credentials', {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          redirect: false
        })

        console.log('📥 Login result:', loginResult)

        if (loginResult?.error) {
          console.error('❌ Auto-login failed:', loginResult.error)
          setSuccess('Account created! Please login manually.')
          setIsSignup(false)
          setLoading(false)
          return
        }

        if (loginResult?.ok) {
          console.log('✅ Auto-login successful!')
          setSuccess('Success! Redirecting to dashboard...')
          
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1000)
        }

      } else {
        // ========== LOGIN - Already using NextAuth which calls backend ==========
        console.log('🔐 Logging in user:', formData.email)

        // Validation
        if (!formData.email.trim()) {
          throw new Error('Please enter your email')
        }
        if (!formData.password) {
          throw new Error('Please enter your password')
        }
        
        const result = await signIn('credentials', {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          redirect: false
        })

        console.log('📥 Login result:', result)

        if (result?.error) {
          console.error('❌ Login failed:', result.error)
          
          if (result.error.includes('Google') || result.error.includes('Facebook')) {
            setError(result.error)
          } else {
            setError('Invalid email or password')
          }
          throw new Error(result.error)
        }

        if (result?.ok) {
          console.log('✅ Login successful!')
          setSuccess('Login successful! Redirecting...')
          
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 500)
        }
      }
    } catch (err: any) {
      console.error('❌ Auth error:', err)
      if (!error) {
        setError(err.message || 'An error occurred')
      }
    } finally {
      if (!success) {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl mx-auto mb-4">
            C
          </div>
          <h1 className="text-3xl font-bold text-primary">Campus Egypt</h1>
          <p className="text-gray-600 mt-2">
            {isSignup ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Debug Info - Shows current API URL */}
        {/* <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
          🌐 API: {API_URL}
        </div> */}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={handleFacebookSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Continue with Facebook
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setIsSignup(false)
              setError('')
              setSuccess('')
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              !isSignup ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsSignup(true)
              setError('')
              setSuccess('')
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              isSignup ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name - Only for Signup */}
          {isSignup && (
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
                placeholder="Ahmed Hassan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={isSignup}
                disabled={loading}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              disabled={loading}
            />
            {isSignup && (
              <p className="text-sm text-gray-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          {/* Role Selection - Only for Signup */}
          {isSignup && (
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                I am a: <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                required={isSignup}
                disabled={loading}
              >
                <option value="student">🎓 Student</option>
                <option value="agent">👨‍💼 Agent</option>
                <option value="owner">🏠 Property Owner</option>
                <option value="service-provider">🔧 Service Provider</option>
              </select>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Please wait...
              </span>
            ) : (
              isSignup ? '🚀 CREATE ACCOUNT' : '🔓 LOGIN'
            )}
          </button>
        </form>

        {/* Back to Home Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-primary font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>

        {/* Additional Info for Signup */}
        {isSignup && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              ✨ <strong>New to Campus Egypt?</strong>
              <br />
              Create your account to access housing, roommates, and home services!
            </p>
          </div>
        )}

        {/* Additional Info for Login */}
        {!isSignup && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setIsSignup(true)
                  setError('')
                  setSuccess('')
                }}
                className="text-primary font-semibold hover:underline"
              >
                Sign up now
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}