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
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s1')}</h2><p>By creating an account or using any part of the Baytino platform, you confirm that you are at least 13 years old and that you agree to these Terms &amp; Conditions and our <Link href="/privacy-policy" className="text-primary hover:underline">{t('terms.privacyLink')}</Link>. If you do not agree, you must not use our services.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s2')}</h2><p>Baytino is an online platform that connects students with property owners, agents, and service providers in Egypt. Our services include browsing and searching student housing listings, creating and managing property listings, connecting with property owners and agents via WhatsApp, and finding roommates and shared housing opportunities. Baytino is a listing platform only and is not a party to any rental agreement between users.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s3')}</h2><ul className="list-disc pl-6 space-y-2"><li>You must provide accurate and complete information when registering.</li><li>You are responsible for maintaining the confidentiality of your account credentials.</li><li>You are responsible for all activity that occurs under your account.</li><li>You must notify us immediately if you suspect unauthorized access to your account.</li></ul></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s4')}</h2><ul className="list-disc pl-6 space-y-2"><li><strong>Students:</strong> May post roommate-seeking listings and browse available housing.</li><li><strong>Agents:</strong> May list properties on behalf of owners.</li><li><strong>Property Owners:</strong> May list their own properties.</li><li><strong>Service Providers:</strong> May advertise housing-related services.</li></ul></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s5')}</h2><ul className="list-disc pl-6 space-y-2"><li>Post false, misleading, or fraudulent listings.</li><li>Impersonate any person or entity.</li><li>Harass, threaten, or harm other users.</li><li>Scrape or extract data from the platform without authorization.</li><li>Attempt to gain unauthorized access to our systems.</li></ul></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s6')}</h2><ul className="list-disc pl-6 space-y-2"><li>You are solely responsible for any content you post.</li><li>By posting content, you grant Baytino a non-exclusive, royalty-free license to display it on the platform.</li><li>We reserve the right to remove any content that violates these Terms.</li></ul></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s7')}</h2><p>Baytino is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. We do not guarantee the accuracy of any listing or that the platform will be uninterrupted. All rental arrangements are solely between the users involved.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s8')}</h2><p>To the fullest extent permitted by law, Baytino and its team shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s9')}</h2><p>All content on Baytino — including the logo, design, text, and software — is the property of Baytino and is protected by copyright and intellectual property laws. You may not copy or reproduce any part of the platform without our written permission.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s10')}</h2><p>We reserve the right to suspend or permanently terminate your account at our sole discretion if we believe you have violated these Terms or engaged in conduct harmful to other users or the platform.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s11')}</h2><p>We may update these Terms &amp; Conditions from time to time. We will notify you of material changes by updating the date at the top of this page. Continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s12')}</h2><p>These Terms are governed by the laws of the Arab Republic of Egypt. Any disputes arising from your use of Baytino shall be subject to the exclusive jurisdiction of the courts of Egypt.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('terms.s13')}</h2><p>If you have questions about these Terms &amp; Conditions, please contact us:</p><div className="mt-3 p-4 bg-gray-50 rounded-xl"><p><strong>Baytino</strong></p><p>Email: <a href="mailto:support@baytino.com" className="text-primary hover:underline">support@baytino.com</a></p><p>Website: <a href="https://baytino.com" className="text-primary hover:underline">baytino.com</a></p></div></section>
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
