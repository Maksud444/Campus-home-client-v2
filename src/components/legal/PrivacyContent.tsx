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
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s1')}</h2><p>We collect information you provide directly to us, such as your name, email address, phone number, and profile photo when you create an account. We also collect information about the properties you post, including photos, descriptions, location, and contact details. Additionally, we automatically collect certain information about your device, including IP address, browser type, and pages visited.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s2')}</h2><p>We use your information to provide and improve our services, to communicate with you about your account and listings, to connect students with property owners and agents, to send you notifications about your posts (such as approval or rejection), and to ensure platform safety and security.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s3')}</h2><p>We do not sell your personal information. We may share your information with other users as necessary to facilitate connections (e.g., showing your WhatsApp number on a listing), with service providers who assist in operating the platform, or when required by law.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s4')}</h2><p>We use cookies and similar tracking technologies to improve your experience on our platform, remember your preferences, and analyze usage patterns. You can control cookie settings through your browser.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s5')}</h2><p>We retain your personal information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s6')}</h2><p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s7')}</h2><p>You have the right to access, correct, or delete your personal information. You may also opt out of receiving promotional communications from us. To exercise these rights, please contact us at <a href="mailto:support@baytino.com" className="text-primary hover:underline">support@baytino.com</a>.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s8')}</h2><p>Our platform may contain links to third-party websites. We are not responsible for the privacy practices of those websites. We encourage you to review the privacy policies of any third-party sites you visit.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s9')}</h2><p>Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s10')}</h2><p>We may update this Privacy Policy from time to time. We will notify you of material changes by updating the date at the top of this page. Your continued use of the platform after changes are posted constitutes your acceptance of the revised policy.</p></section>
            <section><h2 className="text-xl font-bold text-gray-900 mb-3">{t('privacy.s11')}</h2><p>If you have questions about this Privacy Policy, please contact us:</p><div className="mt-3 p-4 bg-gray-50 rounded-xl"><p><strong>Baytino</strong></p><p>Email: <a href="mailto:support@baytino.com" className="text-primary hover:underline">support@baytino.com</a></p><p>Website: <a href="https://baytino.com" className="text-primary hover:underline">baytino.com</a></p></div></section>
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
