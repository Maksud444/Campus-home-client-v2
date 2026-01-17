import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center text-white font-extrabold text-2xl">
                C
              </div>
              <span className="text-2xl font-bold text-white">Campus Home</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Your trusted platform for student housing and home services in Egypt
            </p>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">For Students</h4>
            <ul className="space-y-3">
              <li><Link href="/search" className="hover:text-primary-light transition-colors">Find Housing</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">Find Roommates</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">Post Ad</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">Save Properties</Link></li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">For Owners</h4>
            <ul className="space-y-3">
              <li><Link href="/login" className="hover:text-primary-light transition-colors">List Property</Link></li>
              <li><Link href="/login" className="hover:text-primary-light transition-colors">Manage Listings</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">Resources</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-primary-light transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary-light transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>&copy; 2025 Campus Home. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
