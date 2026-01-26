'use client'

import { useEffect } from 'react'

export default function GoogleTranslate() {
  useEffect(() => {
    // Add Google Translate script
    const script = document.createElement('script')
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    document.body.appendChild(script)

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: 'en,ar,bn,id,uz,ru,fr,kk,ms',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      )
    }

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div id="google_translate_element" className="inline-block"></div>
  )
}

// TypeScript declarations
declare global {
  interface Window {
    google: any
    googleTranslateElementInit: () => void
  }
}