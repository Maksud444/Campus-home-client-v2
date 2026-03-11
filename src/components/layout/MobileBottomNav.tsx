'use client'

import { useState, useEffect } from 'react'
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

interface Tab {
  key: string
  label: string
  href: string
  active: boolean
  icon: React.ReactNode
}

function NavIcon({ active, animKey, children }: { active: boolean; animKey: string; children: React.ReactNode }) {
  const [cls, setCls] = useState('')

  useEffect(() => {
    if (active) {
      setCls('')
      const t = requestAnimationFrame(() => {
        setCls('nav-icon-active')
      })
      return () => cancelAnimationFrame(t)
    } else {
      setCls('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animKey, active])

  return (
    <span className={`inline-flex ${cls}`}>
      {children}
    </span>
  )
}

export default function MobileBottomNav() {
  const pathname = usePathname()
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

  const tabs: Tab[] = [
    {
      key: 'home',
      label: 'Home',
      href: '/',
      active: pathname === '/',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      key: 'properties',
      label: 'Properties',
      href: '/properties',
      active: pathname.startsWith('/properties'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      key: 'services',
      label: 'Services',
      href: '/services',
      active: pathname.startsWith('/services'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      key: 'language',
      label: currentLang?.flag ?? '🌐',
      href: '#',
      active: false,
      icon: (
        <span className="text-2xl leading-none">{currentLang?.flag ?? '🌐'}</span>
      ),
    },
    {
      key: 'post',
      label: 'Post',
      href: session ? '/post' : '/login',
      active: pathname === '/post',
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-end justify-around h-16 px-1">

          {/* Home */}
          <Link
            href={tabs[0].href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-2 pb-1 transition-colors"
          >
            <NavIcon active={tabs[0].active} animKey={pathname}>
              <span className={tabs[0].active ? 'text-primary' : 'text-gray-400'}>
                {tabs[0].icon}
              </span>
            </NavIcon>
            <span className={`text-[10px] font-semibold leading-none ${tabs[0].active ? 'text-primary' : 'text-gray-400'}`}>
              {tabs[0].label}
            </span>
          </Link>

          {/* Properties */}
          <Link
            href={tabs[1].href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-2 pb-1 transition-colors"
          >
            <NavIcon active={tabs[1].active} animKey={pathname}>
              <span className={tabs[1].active ? 'text-primary' : 'text-gray-400'}>
                {tabs[1].icon}
              </span>
            </NavIcon>
            <span className={`text-[10px] font-semibold leading-none ${tabs[1].active ? 'text-primary' : 'text-gray-400'}`}>
              {tabs[1].label}
            </span>
          </Link>

          {/* Services */}
          <Link
            href={tabs[2].href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-2 pb-1 transition-colors"
          >
            <NavIcon active={tabs[2].active} animKey={pathname}>
              <span className={tabs[2].active ? 'text-primary' : 'text-gray-400'}>
                {tabs[2].icon}
              </span>
            </NavIcon>
            <span className={`text-[10px] font-semibold leading-none ${tabs[2].active ? 'text-primary' : 'text-gray-400'}`}>
              {tabs[2].label}
            </span>
          </Link>

          {/* Language */}
          <button
            onClick={() => setLangOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full pt-2 pb-1 text-gray-400 transition-colors"
            aria-label="Change Language"
          >
            <NavIcon active={false} animKey={language}>
              <span className="text-2xl leading-none">{currentLang?.flag ?? '🌐'}</span>
            </NavIcon>
            <span className="text-[10px] font-semibold leading-none text-gray-400">Lang</span>
          </button>

          {/* Post — elevated center FAB */}
          <Link
            href={tabs[4].href}
            className="flex flex-col items-center justify-center flex-1 h-full -mt-5 pb-1 gap-0.5"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 transition-all active:scale-95 ${
              tabs[4].active ? 'bg-primary-dark' : 'bg-primary'
            }`}>
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className={`text-[10px] font-semibold leading-none ${tabs[4].active ? 'text-primary' : 'text-gray-400'}`}>
              Post
            </span>
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
