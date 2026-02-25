'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-2xl">
                B
              </div>
              <span className="text-2xl font-bold text-white">Baytino</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">{t('footer.forStudents')}</h4>
            <ul className="space-y-3">
              <li><Link href="/properties" className="hover:text-primary-light transition-colors">{t('footer.findHousing')}</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">{t('footer.findRoommates')}</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">{t('footer.postAd')}</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">{t('footer.saveProperties')}</Link></li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">{t('footer.forOwners')}</h4>
            <ul className="space-y-3">
              <li><Link href="/login" className="hover:text-primary-light transition-colors">{t('footer.listProperty')}</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">{t('footer.manageListings')}</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">{t('footer.pricing')}</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">{t('footer.resources')}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">{t('footer.company')}</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary-light transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">{t('footer.contact')}</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
