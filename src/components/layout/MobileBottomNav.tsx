'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/contexts/LanguageContext'

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'ar' as const, name: 'العربية', flag: '🇪🇬' },
  { code: 'id' as const, name: 'Indonesia', flag: '🇮🇩' },
  { code: 'bn' as const, name: 'বাংলা', flag: '🇧🇩' },
  { code: 'uz' as const, name: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
  { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  { code: 'kk' as const, name: 'Қазақша', flag: '🇰🇿' },
  { code: 'ms' as const, name: 'Melayu', flag: '🇲🇾' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { language, setLanguage } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)

  if (pathname.startsWith('/admin') || pathname.startsWith('/xadmin') || pathname.startsWith('/admin-login')) return null

  const currentLang = languages.find(l => l.code === language)

  const handleLangChange = (code: typeof language) => {
    setLanguage(code)
    setLangOpen(false)
    const msg = document.createElement('div')
    msg.className = 'fixed top-24 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full shadow-lg z-[999] text-sm font-medium'
    msg.textContent = '✓ Language changed'
    document.body.appendChild(msg)
    setTimeout(() => msg.remove(), 2000)
  }

  const profileHref = (() => {
    if (!session) return '/login'
    const role = (session.user as any)?.role || 'student'
    if (role === 'admin') return '/admin/posts'
    const userId = (session.user as any)?.id || session.user?.email?.split('@')[0]
    return `/dashboard/${role}/${userId}/posts`
  })()

  const isProfileActive = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname === '/login'
  const isPostActive = pathname === '/post'

  return (
    <>
      {/* Bottom Nav — 3 items: Language | Post | Profile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-end justify-around h-16 px-4">

          {/* Language */}
          <button
            onClick={() => setLangOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-2 pb-1 text-gray-400"
            aria-label="Change Language"
          >
            <span className="text-2xl leading-none">{currentLang?.flag ?? '🌐'}</span>
            <span className="text-[10px] font-semibold leading-none">Lang</span>
          </button>

          {/* Post — elevated center FAB */}
          <Link
            href={session ? '/post' : '/login'}
            className="flex flex-col items-center justify-center flex-1 h-full -mt-5 pb-1 gap-0.5"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95 ${
              isPostActive ? 'bg-primary-dark' : 'bg-primary'
            }`}>
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className={`text-[10px] font-semibold leading-none ${isPostActive ? 'text-primary' : 'text-gray-400'}`}>
              Post
            </span>
          </Link>

          {/* Profile / Login */}
          <Link
            href={profileHref}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-2 pb-1 transition-colors"
          >
            <span className={isProfileActive ? 'text-primary' : 'text-gray-400'}>
              {session ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              )}
            </span>
            <span className={`text-[10px] font-semibold leading-none ${isProfileActive ? 'text-primary' : 'text-gray-400'}`}>
              {session ? 'Profile' : 'Login'}
            </span>
          </Link>

        </div>
        <div className="h-safe-bottom bg-white" />
      </nav>

      {/* Language Bottom Sheet */}
      {langOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[70]" onClick={() => setLangOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[80] bg-white rounded-t-3xl shadow-2xl pb-safe">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pb-3 pt-1 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 text-center">Choose Language</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 p-4 max-h-72 overflow-y-auto">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 ${
                    language === lang.code ? 'bg-primary/10 ring-2 ring-primary' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`text-[11px] font-medium leading-tight text-center ${
                    language === lang.code ? 'text-primary' : 'text-gray-700'
                  }`}>{lang.name}</span>
                </button>
              ))}
            </div>
            <div className="pb-6 px-4">
              <button onClick={() => setLangOpen(false)} className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
