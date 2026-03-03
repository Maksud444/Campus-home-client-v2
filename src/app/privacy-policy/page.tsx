import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Baytino - Student Housing Egypt',
  description: 'Learn how Baytino collects, uses, and protects your personal information when you use our student housing platform in Egypt.',
  keywords: 'Baytino privacy policy, student housing Egypt, data protection, personal information',
  openGraph: {
    title: 'Privacy Policy | Baytino',
    description: 'How Baytino protects your personal information.',
    url: 'https://baytino.com/privacy-policy',
    siteName: 'Baytino',
    type: 'website',
  },
  alternates: {
    canonical: 'https://baytino.com/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'March 1, 2025'

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Privacy Policy</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last updated: {lastUpdated}</p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Welcome to <strong>Baytino</strong>. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at <strong>baytino.com</strong>.
            </p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed">

            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="mb-3">We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, and role (student, agent, property owner, or service provider) when you register.</li>
                <li><strong>Profile Information:</strong> Profile photo, phone/WhatsApp number, and any additional details you provide.</li>
                <li><strong>Listing Data:</strong> Property details, location, photos, and pricing information you submit when creating posts.</li>
                <li><strong>Usage Data:</strong> Pages visited, search queries, property views, and interaction data collected automatically.</li>
                <li><strong>Device Data:</strong> IP address, browser type, operating system, and device identifiers.</li>
                <li><strong>Location Data:</strong> GPS coordinates if you use the "Live Location" feature (only with your explicit permission).</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your account.</li>
                <li>To display your property listings to other users.</li>
                <li>To send password reset emails and important service notifications.</li>
                <li>To improve our platform, features, and user experience.</li>
                <li>To enable communication between students and property owners.</li>
                <li>To detect, prevent, and address fraud or security issues.</li>
                <li>To analyze usage patterns and optimize the platform.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Sharing of Information</h2>
              <p className="mb-3">We do <strong>not</strong> sell your personal data. We may share information only in the following cases:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Public Listings:</strong> Information you include in property listings (title, location, photos, WhatsApp number) is visible to all users.</li>
                <li><strong>Service Providers:</strong> We use third-party services (e.g., Cloudinary for image storage, Google for authentication) that process data on our behalf.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Keep you logged in (session cookies).</li>
                <li>Remember your language preference.</li>
                <li>Analyze traffic and usage patterns (analytics).</li>
              </ul>
              <p className="mt-3">You can disable cookies in your browser settings, but some features may not work properly.</p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
              <p>We retain your personal information for as long as your account is active. If you delete your account, we will delete or anonymize your data within 30 days, except where retention is required by law.</p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Security</h2>
              <p>We implement industry-standard security measures including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>HTTPS encryption for all data transmissions.</li>
                <li>Hashed and salted passwords (bcrypt).</li>
                <li>Secure token-based authentication (NextAuth.js).</li>
              </ul>
              <p className="mt-3">However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.</p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access the personal data we hold about you.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and associated data.</li>
                <li>Withdraw consent for optional data processing at any time.</li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us at <strong>support@baytino.com</strong>.</p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Third-Party Links</h2>
              <p>Our platform may contain links to third-party websites (e.g., WhatsApp). We are not responsible for the privacy practices of those sites. We encourage you to read their privacy policies.</p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
              <p>Baytino is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.</p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the date at the top of this page and, where appropriate, sending you an email notification.</p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                <p><strong>Baytino</strong></p>
                <p>Email: <a href="mailto:support@baytino.com" className="text-primary hover:underline">support@baytino.com</a></p>
                <p>Website: <a href="https://baytino.com" className="text-primary hover:underline">baytino.com</a></p>
              </div>
            </section>

          </div>

          {/* Footer links */}
          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline font-medium">Terms & Conditions</Link>
            <Link href="/" className="text-gray-500 hover:text-gray-700">← Back to Home</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
