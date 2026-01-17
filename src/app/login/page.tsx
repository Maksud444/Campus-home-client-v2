'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as 'student' | 'agent' | 'owner'
  })

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError('')
    try {
      await signIn('google', { callbackUrl: '/dashboard', redirect: true })
    } catch (err: any) {
      setError('Google authentication failed')
      setLoading(false)
    }
  }

  const handleFacebookAuth = async () => {
    setLoading(true)
    setError('')
    try {
      await signIn('facebook', { callbackUrl: '/dashboard', redirect: true })
    } catch (err: any) {
      setError('Facebook authentication failed')
      setLoading(false)
    }
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      if (result?.ok) {
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      const result = await signIn('credentials', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false
      })

      if (result?.ok) {
        window.location.href = `/dashboard/${formData.role}`
      } else {
        setError('Registration successful but login failed. Please try logging in.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-extrabold text-3xl mx-auto mb-4">
            C
          </div>
          <h1 className="text-3xl font-bold text-primary">Campus Home</h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back! Sign in to continue' : 'Create your account to get started'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
          </button>

          <button
            onClick={handleFacebookAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#1877F2] text-white rounded-xl font-semibold hover:bg-[#0C63D4] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>{isLogin ? 'Continue with Facebook' : 'Sign up with Facebook'}</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Or {isLogin ? 'login' : 'sign up'} with email</span>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setIsLogin(true)
              setError('')
              setFormData({ name: '', email: '', password: '', role: 'student' })
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              isLogin ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false)
              setError('')
              setFormData({ name: '', email: '', password: '', role: 'student' })
            }}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              !isLogin ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={isLogin ? handleCredentialsLogin : handleRegister} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ahmed Hassan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                I am a: <span className="text-red-500">*</span>
              </label>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                required={!isLogin}
              >
                <option value="student">🎓 Student</option>
                <option value="agent">👨‍💼 Agent</option>
                <option value="owner">🏠 Property Owner</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary text-lg py-4 mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
              <span>{isLogin ? '🔓 LOGIN' : '🚀 CREATE ACCOUNT'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {isLogin ? (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => setIsLogin(false)} 
                className="text-primary font-semibold hover:underline"
              >
                Sign up for free
              </button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => setIsLogin(true)} 
                className="text-primary font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          )}
          
          <Link href="/" className="block text-primary font-semibold hover:underline">
            ← Back to Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && isLogin && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-primary/5 rounded-xl border border-primary/20">
            <p className="font-bold text-primary mb-2 text-sm">🧪 Test Account:</p>
            <div className="text-xs space-y-1 text-gray-700">
              <p><strong>Email:</strong> student@test.com</p>
              <p><strong>Password:</strong> student123</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By {isLogin ? 'logging in' : 'signing up'}, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}