'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4 group w-fit">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-xl group-hover:bg-primary-dark transition-colors">
                B
              </div>
              <span className="text-xl font-extrabold text-white">Baytino</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {t('footer.tagline')}
            </p>
            <a
              href="mailto:support@baytino.com"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@baytino.com
            </a>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.forStudents')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  {t('footer.findHousing')}
                </Link>
              </li>
              <li>
                <Link href="/properties?type=roommate" className="hover:text-white transition-colors">
                  {t('footer.findRoommates')}
                </Link>
              </li>
              <li>
                <Link href="/post" className="hover:text-white transition-colors">
                  {t('footer.postAd')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.forOwners')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  {t('footer.listProperty')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  {t('footer.manageListings')}
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-white transition-colors">
                  {t('footer.findHousing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-white font-bold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <a href="mailto:support@baytino.com" className="hover:text-white transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">
              {t('footer.privacy')}
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
