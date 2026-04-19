'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { usePathname } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-housing-backend.vercel.app'

export default function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useLanguage()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRefDesktop = useRef<HTMLDivElement>(null)
  const notifRefMobile = useRef<HTMLDivElement>(null)
  const [userName, setUserName] = useState('')
  const [userImage, setUserImage] = useState('')

  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/xadmin') || pathname.startsWith('/admin-login')

  useEffect(() => {
    if (isAdminPage) return
    const loadFreshUserData = async () => {
      const wasUpdated = localStorage.getItem('profile_updated')
      if (wasUpdated === 'true') {
        const updatedName = localStorage.getItem('updated_name')
        const updatedImage = localStorage.getItem('updated_image')
        if (updatedName) { setUserName(updatedName); setUserImage(updatedImage || '') }
        localStorage.removeItem('profile_updated')
        localStorage.removeItem('updated_name')
        localStorage.removeItem('updated_image')
        return
      }
      if (session?.user?.email) {
        try {
          const response = await fetch(`${API_URL}/api/auth/profile?email=${session.user.email}`, {
            cache: 'no-store', headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
          })
          const data = await response.json()
          if (data.success && data.user) {
            setUserName(data.user.name); setUserImage(data.user.avatar || '')
          } else {
            setUserName(session.user.name || ''); setUserImage(session.user.image || '')
          }
        } catch {
          setUserName(session.user.name || ''); setUserImage(session.user.image || '')
        }
      }
    }
    loadFreshUserData()
  }, [session?.user?.email, pathname, isAdminPage])

  useEffect(() => {
    if (isAdminPage) return
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isAdminPage])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsProfileOpen(false)
      const inDesktop = notifRefDesktop.current?.contains(event.target as Node)
      const inMobile = notifRefMobile.current?.contains(event.target as Node)
      if (!inDesktop && !inMobile) setIsNotifOpen(false)
    }
    if (isProfileOpen || isNotifOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileOpen, isNotifOpen])

  if (isAdminPage) return null

  const getRoleDisplay = (role?: string) => {
    const roleMap: Record<string, string> = {
      'student': 'Student', 'agent': 'Agent', 'owner': 'Property Owner',
      'service-provider': 'Service Provider', 'admin': 'Admin'
    }
    return roleMap[role || ''] || 'User'
  }

  const getDashboardUrl = () => {
    if (!session?.user) return '/dashboard'
    const role = (session.user as any).role || 'student'
    if (role === 'admin') return '/admin/posts'
    const userId = (session.user as any).id || session.user.email?.split('@')[0]
    return `/dashboard/${role}/${userId}/posts`
  }

  const userRole = (session?.user as any)?.role || 'student'
  const displayName = userName || session?.user?.name || 'User'
  const displayImage = userImage || session?.user?.image || 'https://via.placeholder.com/150'

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  // Notification dropdown content (shared)
  const NotifDropdown = () => (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-bold text-gray-900 text-sm">Notifications</span>
        {unreadCount > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); markAllRead() }}
            className="text-xs text-primary hover:underline font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">
            <div className="text-3xl mb-2">🔔</div>
            No notifications yet
          </div>
        ) : (
          notifications.slice(0, 10).map(n => {
            const dotClass = `w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
              n.type === 'success' ? 'bg-green-500' :
              n.type === 'error'   ? 'bg-red-500'   : 'bg-primary'
            } ${n.read ? 'opacity-0' : ''}`
            const rowClass = `flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`
            if (n.link) {
              return (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => { markRead(n.id); setIsNotifOpen(false) }}
                  className={rowClass}
                >
                  <span className={dotClass} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 hover:text-primary line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.createdAt)}</p>
                  </div>
                </Link>
              )
            }
            return (
              <div key={n.id} onClick={() => markRead(n.id)} className={`${rowClass} cursor-pointer`}>
                <span className={dotClass} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatTime(n.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <Link
            href={getDashboardUrl()}
            onClick={() => setIsNotifOpen(false)}
            className="text-xs text-primary hover:underline font-medium"
          >
            View all in dashboard →
          </Link>
        </div>
      )}
    </div>
  )

  // Bell icon — desktop version
  const BellDesktop = () => (
    <div className="relative" ref={notifRefDesktop}>
      <button
        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false) }}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isNotifOpen && <NotifDropdown />}
    </div>
  )

  // Bell icon — mobile version
  const BellMobile = () => (
    <div className="relative" ref={notifRefMobile}>
      <button
        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false) }}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isNotifOpen && <NotifDropdown />}
    </div>
  )

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white/95 backdrop-blur-md shadow-md py-4'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center">
          {/* Logo - centered on mobile, left on desktop */}
          <Link href="/" className="flex items-center gap-2 group md:flex-shrink-0 flex-1 md:flex-none justify-center md:justify-start">
            <Image src="/logo.svg" alt="Baytino Logo" width={40} height={40} priority />
            <span className="text-2xl font-bold text-primary">Baytino</span>
          </Link>

          {/* Desktop Nav Links - CENTER */}
          <div className="hidden md:flex flex-1 justify-center items-center gap-7">
            <Link href="/" className="font-semibold hover:text-primary transition-colors flex items-center gap-1.5 text-gray-700">
              <span>🏠</span><span>{t('nav.home')}</span>
            </Link>
            <Link href="/properties" className="font-semibold hover:text-primary transition-colors flex items-center gap-1.5 text-gray-700">
              <span>🏢</span><span>{t('nav.properties')}</span>
            </Link>
            <Link href="/services" className="font-semibold hover:text-primary transition-colors flex items-center gap-1.5 text-gray-700">
              <span>🔧</span><span>{t('nav.services')}</span>
            </Link>
            <Link href={session ? '/post' : '/login'} className="font-semibold hover:text-primary transition-colors flex items-center gap-1.5 text-gray-700">
              <span>➕</span><span>{t('nav.createPost')}</span>
            </Link>
          </div>

          {/* Desktop Auth - RIGHT */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {session && userRole === 'admin' && (
              <Link href="/admin" className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </Link>
            )}

            {/* Bell icon — desktop (only when logged in) */}
            {session && <BellDesktop />}

            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {displayImage ? (
                    <Image src={displayImage} alt={displayName} width={36} height={36} className="rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold">{displayName.charAt(0)}</div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 text-sm">{displayName}</div>
                    <div className="text-xs text-gray-600">{getRoleDisplay(userRole)}</div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {displayImage ? (
                          <Image src={displayImage} alt={displayName} width={48} height={48} className="rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">{displayName.charAt(0)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 truncate">{displayName}</div>
                          <div className="text-sm text-gray-600 truncate">{session.user?.email}</div>
                          <div className="text-xs text-primary font-semibold mt-1">{getRoleDisplay(userRole)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href={getDashboardUrl()} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors">
                        <span className="text-xl">📊</span>
                        <div><div className="font-semibold text-gray-900">{t('nav.dashboard')}</div><div className="text-xs text-gray-600">View your dashboard</div></div>
                      </Link>
                      {userRole === 'admin' && (
                        <Link href="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors">
                          <span className="text-xl">🛡️</span>
                          <div><div className="font-semibold text-red-600">Admin Panel</div><div className="text-xs text-gray-600">Manage platform</div></div>
                        </Link>
                      )}
                      <Link href="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors">
                        <span className="text-xl">⚙️</span>
                        <div><div className="font-semibold text-gray-900">{t('nav.settings')}</div><div className="text-xs text-gray-600">Manage your account</div></div>
                      </Link>
                      <Link href="/post" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors">
                        <span className="text-xl">➕</span>
                        <div><div className="font-semibold text-gray-900">{t('nav.createPost')}</div><div className="text-xs text-gray-600">{t('post.propertyDesc')}</div></div>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 pt-2">
                      <button onClick={() => { setIsProfileOpen(false); signOut({ callbackUrl: '/' }) }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors">
                        <span className="text-xl">🚪</span>
                        <div className="text-left"><div className="font-semibold">{t('nav.logout')}</div><div className="text-xs">Sign out of your account</div></div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors px-4 py-2">{t('nav.login')}</Link>
                <Link href="/login" className="btn btn-primary">{t('nav.getStarted')}</Link>
              </div>
            )}
          </div>

          {/* Mobile: Bell + Hamburger group — right side */}
          <div className="md:hidden flex items-center gap-1 flex-shrink-0">
            {session && <BellMobile />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-800 hover:text-primary transition-colors p-1"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                <span>🏠</span><span>{t('nav.home')}</span>
              </Link>
              <Link href="/properties" className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                <span>🏢</span><span>{t('nav.properties')}</span>
              </Link>
              <Link href="/services" className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                <span>🔧</span><span>{t('nav.services')}</span>
              </Link>
              <Link href={session ? '/post' : '/login'} className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2" onClick={() => setMobileMenuOpen(false)}>
                <span>➕</span><span>{t('nav.createPost')}</span>
              </Link>

              <div className="pt-4 border-t border-gray-200">
                {session ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      {displayImage ? (
                        <Image src={displayImage} alt={displayName} width={48} height={48} className="rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">{displayName.charAt(0)}</div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{displayName}</div>
                        <div className="text-sm text-gray-600">{getRoleDisplay(userRole)}</div>
                      </div>
                    </div>
                    <Link href={getDashboardUrl()} className="btn btn-outline w-full" onClick={() => setMobileMenuOpen(false)}>{t('nav.dashboard')}</Link>
                    <Link href="/settings" className="btn btn-outline w-full" onClick={() => setMobileMenuOpen(false)}>{t('nav.settings')}</Link>
                    <Link href="/post" className="btn btn-outline w-full" onClick={() => setMobileMenuOpen(false)}>{t('nav.createPost')}</Link>
                    <button onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false) }} className="btn btn-primary w-full">{t('nav.logout')}</button>
                  </div>
                ) : (
                  <Link href="/login" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>{t('nav.login')}</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
