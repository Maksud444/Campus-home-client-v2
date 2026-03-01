'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const router = useRouter()
  const { data: session } = useSession()
  const { language, setLanguage } = useLanguage()
  const [langOpen, setLangOpen] = useState(false)

  // Hide on admin pages
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

  const tabs = [
    {
      key: 'home',
      label: 'Home',
      href: '/',
      active: pathname === '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: 'create',
      label: 'Post',
      href: session ? '/post' : '/login',
      active: pathname === '/create-post',
      isCreate: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      key: 'profile',
      label: 'Profile',
      href: session ? '/dashboard' : '/login',
      active: pathname === '/dashboard' || pathname === '/profile' || pathname === '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-2">

          {/* Home */}
          <Link
            href={tabs[0].href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              tabs[0].active ? 'text-primary' : 'text-gray-400'
            }`}
          >
            {tabs[0].icon}
            <span className="text-[10px] font-medium">{tabs[0].label}</span>
          </Link>

          {/* Language */}
          <button
            onClick={() => setLangOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-gray-400 transition-colors"
            aria-label="Change Language"
          >
            <span className="text-xl leading-none">{currentLang?.flag ?? '🌐'}</span>
            <span className="text-[10px] font-medium">Language</span>
          </button>

          {/* Create Post — center, elevated */}
          <Link
            href={tabs[1].href}
            className="flex flex-col items-center justify-center -mt-5 flex-1"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95 ${
              tabs[1].active ? 'bg-primary-dark' : 'bg-primary'
            }`}>
              {tabs[1].icon}
              <span className="sr-only">Create Post</span>
            </div>
            <span className={`text-[10px] font-medium mt-0.5 ${tabs[1].active ? 'text-primary' : 'text-gray-400'}`}>
              {tabs[1].label}
            </span>
          </Link>

          {/* Profile */}
          <Link
            href={tabs[2].href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
              tabs[2].active ? 'text-primary' : 'text-gray-400'
            }`}
          >
            {tabs[2].icon}
            <span className="text-[10px] font-medium">{tabs[2].label}</span>
          </Link>

        </div>

        {/* Safe area for iOS home bar */}
        <div className="h-safe-bottom bg-white" />
      </nav>

      {/* Language Bottom Sheet */}
      {langOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[70]"
            onClick={() => setLangOpen(false)}
          />
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
                    language === lang.code
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-gray-50 hover:bg-gray-100'
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
              <button
                onClick={() => setLangOpen(false)}
                className="w-full py-3 rounded-2xl bg-gray-100 text-gray-600 font-semibold text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
