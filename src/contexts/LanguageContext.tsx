'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ar' | 'bn' | 'id' | 'uz' | 'ru' | 'fr' | 'kk' | 'ms'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.properties': 'Properties',
    'nav.services': 'Services',
    'nav.login': 'Login',
    'nav.getStarted': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.createPost': 'Create Post',
    'nav.logout': 'Logout',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.properties': 'العقارات',
    'nav.services': 'الخدمات',
    'nav.login': 'تسجيل الدخول',
    'nav.getStarted': 'ابدأ',
    'nav.dashboard': 'لوحة التحكم',
    'nav.settings': 'الإعدادات',
    'nav.createPost': 'إنشاء منشور',
    'nav.logout': 'خروج',
  },
  bn: {
    'nav.home': 'হোম',
    'nav.properties': 'প্রপার্টি',
    'nav.services': 'সেবা',
    'nav.login': 'লগইন',
    'nav.getStarted': 'শুরু করুন',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.settings': 'সেটিংস',
    'nav.createPost': 'পোস্ট করুন',
    'nav.logout': 'লগআউট',
  },
  id: {
    'nav.home': 'Beranda',
    'nav.properties': 'Properti',
    'nav.services': 'Layanan',
    'nav.login': 'Masuk',
    'nav.getStarted': 'Mulai',
    'nav.dashboard': 'Dasbor',
    'nav.settings': 'Pengaturan',
    'nav.createPost': 'Buat Post',
    'nav.logout': 'Keluar',
  },
  uz: {
    'nav.home': 'Bosh sahifa',
    'nav.properties': 'Mulklar',
    'nav.services': 'Xizmatlar',
    'nav.login': 'Kirish',
    'nav.getStarted': 'Boshlash',
    'nav.dashboard': 'Boshqaruv',
    'nav.settings': 'Sozlamalar',
    'nav.createPost': 'Post yaratish',
    'nav.logout': 'Chiqish',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.properties': 'Недвижимость',
    'nav.services': 'Услуги',
    'nav.login': 'Войти',
    'nav.getStarted': 'Начать',
    'nav.dashboard': 'Панель',
    'nav.settings': 'Настройки',
    'nav.createPost': 'Создать',
    'nav.logout': 'Выйти',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.properties': 'Propriétés',
    'nav.services': 'Services',
    'nav.login': 'Connexion',
    'nav.getStarted': 'Commencer',
    'nav.dashboard': 'Tableau de bord',
    'nav.settings': 'Paramètres',
    'nav.createPost': 'Créer',
    'nav.logout': 'Déconnexion',
  },
  kk: {
    'nav.home': 'Басты бет',
    'nav.properties': 'Мүлік',
    'nav.services': 'Қызметтер',
    'nav.login': 'Кіру',
    'nav.getStarted': 'Бастау',
    'nav.dashboard': 'Басқару',
    'nav.settings': 'Параметрлер',
    'nav.createPost': 'Жасау',
    'nav.logout': 'Шығу',
  },
  ms: {
    'nav.home': 'Utama',
    'nav.properties': 'Hartanah',
    'nav.services': 'Perkhidmatan',
    'nav.login': 'Log Masuk',
    'nav.getStarted': 'Mula',
    'nav.dashboard': 'Papan Pemuka',
    'nav.settings': 'Tetapan',
    'nav.createPost': 'Buat',
    'nav.logout': 'Log Keluar',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language]?.[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}