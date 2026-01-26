'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Navbar() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ✅ Debug: Log session to check role
  useEffect(() => {
    if (session) {
      console.log('👤 Current Session:', session)
      console.log('👤 User Role:', session.user?.role)
      console.log('👤 User Data:', session.user)
    }
  }, [session])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileOpen])

  // ✅ Get role display text with proper mapping
  const getRoleDisplay = (role?: string) => {
    if (!role) return 'User'
    
    const roleMap: Record<string, string> = {
      'student': 'Student',
      'agent': 'Agent',
      'owner': 'Property Owner',
      'service-provider': 'Service Provider',
      'admin': 'Admin'
    }
    
    return roleMap[role] || 'User'
  }

  const getDashboardUrl = () => {
    if (!session?.user) return '/dashboard'
    const userId = (session.user as any).id || session.user.email?.split('@')[0]
    const role = (session.user as any).role || 'student'
    return `/dashboard/${role}/${userId}`
  }

  // ✅ Get current user role
  const userRole = (session?.user as any)?.role || 'student'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white shadow-lg py-3' 
        : 'bg-white/95 backdrop-blur-md shadow-md py-4'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl transition-all bg-primary text-white`}>
              C
            </div>
            <span className="text-2xl font-bold text-primary">
              Campus Egypt
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className="font-semibold hover:text-primary transition-colors flex items-center gap-2 text-gray-700"
            >
              <span>🏠</span>
              <span>{t('nav.home')}</span>
            </Link>
            <Link 
              href="/properties" 
              className="font-semibold hover:text-primary transition-colors flex items-center gap-2 text-gray-700"
            >
              <span>🏢</span>
              <span>{t('nav.properties')}</span>
            </Link>
            <Link 
              href="/services" 
              className="font-semibold hover:text-primary transition-colors flex items-center gap-2 text-gray-700"
            >
              <span>🔧</span>
              <span>{t('nav.services')}</span>
            </Link>

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={36}
                      height={36}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                      {session.user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">
                      {session.user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {/* ✅ Use getRoleDisplay function */}
                      {getRoleDisplay(userRole)}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      isProfileOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {session.user?.image ? (
                          <Image
                            src={session.user.image}
                            alt={session.user.name || 'User'}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {session.user?.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 truncate">
                            {session.user?.name || 'User'}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {session.user?.email}
                          </div>
                          {/* ✅ Show role in dropdown */}
                          <div className="text-xs text-primary font-semibold mt-1">
                            {getRoleDisplay(userRole)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        href={getDashboardUrl()}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xl">📊</span>
                        <div>
                          <div className="font-semibold text-gray-900">{t('nav.dashboard')}</div>
                          <div className="text-xs text-gray-600">View your dashboard</div>
                        </div>
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xl">⚙️</span>
                        <div>
                          <div className="font-semibold text-gray-900">{t('nav.settings')}</div>
                          <div className="text-xs text-gray-600">Manage your account</div>
                        </div>
                      </Link>

                      <Link
                        href="/create-post"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xl">➕</span>
                        <div>
                          <div className="font-semibold text-gray-900">{t('nav.createPost')}</div>
                          <div className="text-xs text-gray-600">Find roommate or room</div>
                        </div>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <span className="text-xl">🚪</span>
                        <div className="text-left">
                          <div className="font-semibold">{t('nav.logout')}</div>
                          <div className="text-xs">Sign out of your account</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-primary font-semibold hover:text-primary-dark transition-colors px-4 py-2"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary"
                >
                  {t('nav.getStarted')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-800 hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>🏠</span>
                <span>{t('nav.home')}</span>
              </Link>
              <Link 
                href="/properties" 
                className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>🏢</span>
                <span>{t('nav.properties')}</span>
              </Link>
              <Link 
                href="/services" 
                className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>🔧</span>
                <span>{t('nav.services')}</span>
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                {session ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {session.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                          {session.user?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">
                          {session.user?.name || 'User'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {/* ✅ Use getRoleDisplay function */}
                          {getRoleDisplay(userRole)}
                        </div>
                      </div>
                    </div>
                    
                    <Link 
                      href={getDashboardUrl()} 
                      className="btn btn-outline w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link 
                      href="/settings" 
                      className="btn btn-outline w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.settings')}
                    </Link>
                    <Link 
                      href="/create-post" 
                      className="btn btn-outline w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.createPost')}
                    </Link>
                    <button 
                      onClick={() => {
                        signOut({ callbackUrl: '/' })
                        setMobileMenuOpen(false)
                      }} 
                      className="btn btn-primary w-full"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="btn btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}