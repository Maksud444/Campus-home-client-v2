'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, Home, Building2, Wrench } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white shadow-lg py-3' 
        : 'bg-white/95 backdrop-blur-md shadow-md py-4'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${
              scrolled
                ? 'bg-primary text-white'
                : 'bg-primary text-white'
            }`}>
              C
            </div>
            <span className={`text-2xl font-bold transition-colors ${
              scrolled
                ? 'text-primary'
                : 'text-primary'
            }`}>
              Campus Egypt
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`font-semibold hover:text-primary transition-colors flex items-center gap-2 ${
                scrolled ? 'text-gray-700' : 'text-gray-800'
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link 
              href="/properties" 
              className={`font-semibold hover:text-primary transition-colors flex items-center gap-2 ${
                scrolled ? 'text-gray-700' : 'text-gray-800'
              }`}
            >
              <Building2 size={18} />
              <span>Properties</span>
            </Link>
            <Link 
              href="/services/plumbing" 
              className={`font-semibold hover:text-primary transition-colors flex items-center gap-2 ${
                scrolled ? 'text-gray-700' : 'text-gray-800'
              }`}
            >
              <Wrench size={18} />
              <span>Services</span>
            </Link>

            {session ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard" 
                  className="btn btn-outline hover:scale-105 transition-transform"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={() => signOut()} 
                  className="btn btn-primary hover:scale-105 transition-transform"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="btn btn-primary hover:scale-105 transition-transform"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-800 hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-fadeIn">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Link 
                href="/properties" 
                className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building2 size={20} />
                <span>Properties</span>
              </Link>
              <Link 
                href="/services/plumbing" 
                className="text-gray-800 font-semibold hover:text-primary transition-colors flex items-center gap-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Wrench size={20} />
                <span>Services</span>
              </Link>
              
              <div className="pt-4 border-t border-gray-200">
                {session ? (
                  <div className="flex flex-col gap-3">
                    <Link 
                      href="/dashboard" 
                      className="btn btn-outline w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }} 
                      className="btn btn-primary w-full"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="btn btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}