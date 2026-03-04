'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PrivacyContent() {
  const { t } = useLanguage()
  const lastUpdated = 'March 1, 2025'
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{t('privacy.breadcrumb')}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="mb-8 pb-8 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{t('privacy.title')}</h1>
            <p className="text-gray-500 text-sm">{t('privacy.lastUpdated')} {lastUpdated}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{t('privacy.intro')}</p>
          </div>
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s1')}</h2><p>{t('privacy.s1_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s2')}</h2><p>{t('privacy.s2_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s3')}</h2><p>{t('privacy.s3_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s4')}</h2><p>{t('privacy.s4_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s5')}</h2><p>{t('privacy.s5_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s6')}</h2><p>{t('privacy.s6_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s7')}</h2><p>{t('privacy.s7_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s8')}</h2><p>{t('privacy.s8_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s9')}</h2><p>{t('privacy.s9_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s10')}</h2><p>{t('privacy.s10_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s11')}</h2><p>{t('privacy.s11_body')}</p></section>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline font-medium">{t('privacy.termsLink')}</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700">{t('privacy.backHome')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
