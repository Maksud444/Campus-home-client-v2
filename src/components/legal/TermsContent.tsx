'use client'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function TermsContent() {
  const { t } = useLanguage()
  const lastUpdated = 'March 1, 2025'
  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">{t('terms.breadcrumb')}</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="mb-8 pb-8 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{t('terms.title')}</h1>
            <p className="text-gray-500 text-sm">{t('terms.lastUpdated')} {lastUpdated}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">{t('terms.intro')}</p>
          </div>
          <div className="space-y-8 text-gray-700 leading-relaxed">
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s1')}</h2><p>{t('terms.s1_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s2')}</h2><p>{t('terms.s2_body')}</p></section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s3')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                {t('terms.s3_body').split('\n').map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s4')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                {t('terms.s4_body').split('\n').map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s5')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                {t('terms.s5_body').split('\n').map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s6')}</h2>
              <ul className="list-disc pl-6 space-y-2">
                {t('terms.s6_body').split('\n').map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s7')}</h2><p>{t('terms.s7_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s8')}</h2><p>{t('terms.s8_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s9')}</h2><p>{t('terms.s9_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s10')}</h2><p>{t('terms.s10_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s11')}</h2><p>{t('terms.s11_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s12')}</h2><p>{t('terms.s12_body')}</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s13')}</h2><p>{t('terms.s13_body')}</p></section>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link href="/privacy-policy" className="text-primary hover:underline font-medium">{t('terms.privacyLink')}</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700">{t('terms.backHome')}</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
