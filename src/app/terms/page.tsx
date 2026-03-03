import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Baytino - Student Housing Egypt',
  description: 'Read the Terms & Conditions governing your use of Baytino, the student housing platform in Egypt. Understand your rights and responsibilities.',
  keywords: 'Baytino terms and conditions, student housing Egypt, terms of service, user agreement',
  openGraph: {
    title: 'Terms & Conditions | Baytino',
    description: 'Terms governing your use of the Baytino student housing platform.',
    url: 'https://baytino.com/terms',
    siteName: 'Baytino',
    type: 'website',
  },
  alternates: {
    canonical: 'https://baytino.com/terms',
  },
}

export default function TermsPage() {
  const lastUpdated = 'March 1, 2025'

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Terms &amp; Conditions</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Terms &amp; Conditions</h1>
            <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Welcome to <strong>Baytino</strong>. By accessing or using our platform at <strong>baytino.com</strong>, you agree to be bound by these Terms &amp; Conditions. Please read them carefully before using our services.
            </p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By creating an account or using any part of the Baytino platform, you confirm that you are at least 13 years old and that you agree to these Terms &amp; Conditions and our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>. If you do not agree, you must not use our services.</p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
              <p className="mb-3">Baytino is an online platform that connects students with property owners, agents, and service providers in Egypt. Our services include:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browsing and searching student housing listings.</li>
                <li>Creating and managing property listings.</li>
                <li>Connecting with property owners and agents via WhatsApp.</li>
                <li>Finding roommates and shared housing opportunities.</li>
              </ul>
              <p className="mt-3">Baytino is a <strong>listing platform only</strong>. We do not own, manage, or control any property listed on our platform, and we are not a party to any rental agreement between users.</p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information when registering.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activity that occurs under your account.</li>
                <li>You must notify us immediately if you suspect unauthorized access to your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. User Roles and Responsibilities</h2>
              <p className="mb-3">Users register under one of the following roles, each with specific responsibilities:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Students:</strong> May post roommate-seeking listings and browse available housing.</li>
                <li><strong>Agents:</strong> May list properties on behalf of owners. Must have proper authorization.</li>
                <li><strong>Property Owners:</strong> May list their own properties and are responsible for accuracy of listings.</li>
                <li><strong>Service Providers:</strong> May advertise housing-related services (movers, cleaners, etc.).</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Prohibited Activities</h2>
              <p className="mb-3">You agree <strong>not</strong> to use Baytino to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Post false, misleading, or fraudulent listings.</li>
                <li>Impersonate any person or entity.</li>
                <li>Harass, threaten, or harm other users.</li>
                <li>Post content that is illegal, offensive, or violates intellectual property rights.</li>
                <li>Scrape, crawl, or extract data from the platform without authorization.</li>
                <li>Use automated tools to create accounts or submit listings.</li>
                <li>Attempt to gain unauthorized access to our systems or another user&apos;s account.</li>
                <li>List properties you do not own or are not authorized to list.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Content and Listings</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are solely responsible for any content you post, including photos, descriptions, and contact details.</li>
                <li>By posting content, you grant Baytino a non-exclusive, royalty-free license to display and distribute your content on the platform.</li>
                <li>We reserve the right to remove any content that violates these Terms without prior notice.</li>
                <li>Property prices, availability, and details are the responsibility of the listing owner. Baytino does not verify listing accuracy.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Disclaimer of Warranties</h2>
              <p>Baytino is provided on an <strong>&quot;as is&quot;</strong> and <strong>&quot;as available&quot;</strong> basis without warranties of any kind. We do not guarantee:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>The accuracy, completeness, or reliability of any listing.</li>
                <li>That the platform will be uninterrupted, error-free, or secure.</li>
                <li>That any property or service listed will meet your expectations.</li>
              </ul>
              <p className="mt-3">All rental or service arrangements are solely between the users involved. Baytino is not responsible for any disputes, losses, or damages arising from transactions between users.</p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, Baytino and its team shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of — or inability to use — the platform. This includes, but is not limited to, loss of data, lost profits, or property damage resulting from reliance on listings.</p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Intellectual Property</h2>
              <p>All content on Baytino — including the logo, design, text, and software — is the property of Baytino and is protected by copyright and intellectual property laws. You may not copy, reproduce, or distribute any part of the platform without our written permission, except for personal, non-commercial use.</p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Termination</h2>
              <p>We reserve the right to suspend or permanently terminate your account at our sole discretion, with or without notice, if we believe you have violated these Terms or engaged in conduct harmful to other users or the platform. Upon termination, your right to use the platform ceases immediately.</p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Changes to These Terms</h2>
              <p>We may update these Terms &amp; Conditions from time to time. We will notify you of material changes by updating the date at the top of this page. Continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.</p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
              <p>These Terms are governed by the laws of the Arab Republic of Egypt. Any disputes arising from your use of Baytino shall be subject to the exclusive jurisdiction of the courts of Egypt.</p>
            </section>

            {/* Section 13 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact Us</h2>
              <p>If you have questions about these Terms &amp; Conditions, please contact us:</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                <p><strong>Baytino</strong></p>
                <p>Email: <a href="mailto:support@baytino.com" className="text-primary hover:underline">support@baytino.com</a></p>
                <p>Website: <a href="https://baytino.com" className="text-primary hover:underline">baytino.com</a></p>
              </div>
            </section>

          </div>

          {/* Footer links */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link href="/privacy-policy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700">← Back to Home</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
