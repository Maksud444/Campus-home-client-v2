'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function MobileLanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
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

  const handleLanguageChange = (code: typeof language) => {
    setLanguage(code)
    setIsOpen(false)
    
    // Show success message
    const message = document.createElement('div')
    message.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-full shadow-lg z-[999] animate-bounce'
    message.textContent = `✓ Language changed`
    document.body.appendChild(message)
    
    setTimeout(() => {
      message.remove()
    }, 2000)
  }

  return (
    <>
      {/* Fixed Bottom Button - Mobile Only */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-4">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-2xl shadow-2xl border-2 border-gray-100 flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span className="text-lg">Change Language</span>
          <span className="text-2xl">{currentLang?.flag}</span>
        </button>
      </div>

      {/* Language Selection Modal/Bottom Sheet */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[60] animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[80vh] overflow-hidden">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Select Language</h3>
                <p className="text-sm text-gray-600 mt-1">Choose your preferred language</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Language List */}
            <div className="overflow-y-auto max-h-[calc(80vh-140px)] pb-6">
              <div className="px-4 py-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all mb-2 ${
                      language === lang.code
                        ? 'bg-primary text-white shadow-lg scale-[1.02]'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <span className="text-4xl">{lang.flag}</span>
                    <div className="flex-1 text-left">
                      <div className={`font-bold text-lg ${
                        language === lang.code ? 'text-white' : 'text-gray-900'
                      }`}>
                        {lang.name}
                      </div>
                    </div>
                    {language === lang.code && (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}