'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DesktopLanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
    { code: 'ar' as const, name: 'العربية', flag: '🇪🇬' },
    { code: 'id' as const, name: 'Indonesia', flag: '🇮🇩' },
    { code: 'bn' as const, name: 'বাংলা', flag: '🇧🇩' },
    { code: 'uz' as const, name: 'O\'zbekcha', flag: '🇺🇿' },
    { code: 'ru' as const, name: 'Русский', flag: '🇷🇺' },
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
    { code: 'kk' as const, name: 'Қазақша', flag: '🇰🇿' },
    { code: 'ms' as const, name: 'Melayu', flag: '🇲🇾' },
  ]

  const currentLang = languages.find(lang => lang.code === language)

  return (
    <div className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-50">
      {/* Sidebar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white py-6 px-3 rounded-l-2xl shadow-2xl hover:px-4 transition-all flex flex-col items-center gap-2 border-l-4 border-white"
        aria-label="Change Language"
      >
        <span className="text-3xl mb-1">{currentLang?.flag}</span>
        <div className="writing-mode-vertical text-sm font-bold tracking-wider whitespace-nowrap">
          {t('changeLanguage')}
        </div>
      </button>

      {/* Language Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-[-1]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 min-w-[280px] animate-slide-in-left">
            {/* Header */}
            <div className="px-3 py-3 border-b border-gray-100 mb-2 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{t('common.selectLanguage')}</p>
                <p className="text-xs text-gray-600 mt-0.5">Choose your preferred language</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Language List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                    
                    // Show success notification
                    const notification = document.createElement('div')
                    notification.className = 'fixed top-24 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-[999] flex items-center gap-2 animate-bounce'
                    notification.innerHTML = `
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Language changed to ${lang.name}</span>
                    `
                    document.body.appendChild(notification)
                    
                    setTimeout(() => {
                      notification.remove()
                    }, 2500)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all mb-1.5 ${
                    language === lang.code
                      ? 'bg-primary text-white shadow-md'
                      : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <span className={`font-semibold text-base flex-1 text-left ${
                    language === lang.code ? 'text-white' : 'text-gray-900'
                  }`}>
                    {lang.name}
                  </span>
                  {language === lang.code && (
                    <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #219ebc;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1a7a91;
        }
      `}</style>
    </div>
  )
}