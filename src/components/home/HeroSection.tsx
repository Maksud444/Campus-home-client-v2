'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'

export default function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('apartment')
  const [currentSlide, setCurrentSlide] = useState(0)
  const servicesRef = useRef<HTMLDivElement>(null)

  const bgRef = useRef<HTMLDivElement>(null)
  const circle1Ref = useRef<HTMLDivElement>(null)
  const circle2Ref = useRef<HTMLDivElement>(null)
  const circle3Ref = useRef<HTMLDivElement>(null)
  const circle4Ref = useRef<HTMLDivElement>(null)

  const services = [
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      label: 'Appliance Repair',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      label: 'Cleaning Solution',
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Beauty & Wellness',
      gradient: 'from-pink-500 to-rose-500'
    },
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      label: 'Shifting',
      gradient: 'from-orange-500 to-red-500'
    },
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      label: 'Health & Care',
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: 'Electrical',
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      label: 'Painting',
      gradient: 'from-indigo-500 to-purple-500'
    },
    { 
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      label: 'Carpentry',
      gradient: 'from-amber-600 to-yellow-600'
    },
  ]

  const itemsPerSlide = 5
  const totalSlides = Math.ceil(services.length / itemsPerSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const visibleServices = services.slice(
    currentSlide * itemsPerSlide,
    (currentSlide + 1) * itemsPerSlide
  )

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background image subtle zoom and pan
      gsap.to(bgRef.current, {
        scale: 1.1,
        x: -20,
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Circle 1 - floating
      gsap.to(circle1Ref.current, {
        y: -50,
        x: 30,
        scale: 1.2,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Circle 2 - rotating float
      gsap.to(circle2Ref.current, {
        y: 40,
        x: -40,
        scale: 0.8,
        rotation: 360,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Circle 3 - diagonal movement
      gsap.to(circle3Ref.current, {
        y: -30,
        x: -30,
        scale: 1.3,
        duration: 12,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Circle 4 - pulse and move
      gsap.to(circle4Ref.current, {
        y: 50,
        x: 40,
        scale: 1.5,
        opacity: 0.3,
        duration: 15,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

    })

    return () => ctx.revert()
  }, [])

  const handleSearch = (e: React.MouseEvent) => {
    e.preventDefault()
    // Navigate based on active tab
    if (activeTab === 'services') {
      router.push('/services/plumbing')
    } else if (activeTab === 'roommate') {
      router.push('/properties?type=room')
    } else {
      router.push(`/properties?type=${activeTab}`)
    }
  }

  const tabs = [
    { id: 'apartment', label: 'Full Apartment' },
    { id: 'studio', label: '1 Bedroom' },
    { id: 'roommate', label: 'Share Roommate' },
    { id: 'services', label: 'Services' }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-16 overflow-hidden mt-20">
      {/* Animated Background Image */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600)',
          transformOrigin: 'center center'
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Animated Background Circles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div 
          ref={circle1Ref}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <div 
          ref={circle2Ref}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <div 
          ref={circle3Ref}
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <div 
          ref={circle4Ref}
          className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        />
      </div>

      {/* Static Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center w-full">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-3 leading-tight">
          Your Personal Assistant
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-16 font-light">
          One-stop solution for your services. Order any service, anytime.
        </p>

        {/* Search Box */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12 max-w-5xl mx-auto">
          {/* Search Bar */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-4 border-2 border-gray-200 focus-within:border-primary transition-all">
                <svg className="w-6 h-6 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <select className="flex-1 bg-transparent outline-none text-gray-700 font-medium text-lg cursor-pointer">
                  <option>Cairo</option>
                  <option>Nasr City</option>
                  <option>Maadi</option>
                  <option>Giza</option>
                  <option>Heliopolis</option>
                  <option>New Cairo</option>
                  <option>Zamalek</option>
                </select>
              </div>

              <div className="flex-[2] flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-4 border-2 border-gray-200 focus-within:border-primary transition-all">
                <svg className="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Find your service here e.g. AC, Plumbing, Cleaning ..." 
                  className="flex-1 bg-transparent outline-none text-gray-700 text-lg placeholder:text-gray-400"
                />
              </div>

              <button 
                onClick={handleSearch}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Service Categories */}
          <div className="relative px-4 pb-6 border-t border-gray-100">
            <div className="flex items-center gap-3 py-6">
              <button 
                onClick={prevSlide}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-50"
                disabled={currentSlide === 0}
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex-1 overflow-hidden">
                <div 
                  ref={servicesRef}
                  className="flex gap-8 justify-center items-center transition-all duration-500 ease-in-out"
                >
                  {visibleServices.map((service, index) => (
                    <button
                      key={currentSlide * itemsPerSlide + index}
                      className="flex flex-col items-center gap-3 hover:scale-110 transition-all group min-w-[100px]"
                    >
                      <div className="p-4 rounded-2xl bg-white border-2 border-gray-100 shadow-md group-hover:shadow-xl transition-all group-hover:border-[#219EBC]">
                        <div style={{ color: '#219EBC' }}>
                          {service.icon}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 whitespace-nowrap text-center">{service.label}</span>
                    </button>
                  ))}

                  {/* All Services - Always visible */}
                  {currentSlide === totalSlides - 1 && (
                    <button className="flex flex-col items-center gap-3 hover:scale-110 transition-all group min-w-[100px]">
                      <div className="p-4 rounded-2xl bg-white border-2 border-gray-100 shadow-md group-hover:shadow-xl transition-all group-hover:border-[#219EBC]">
                        <svg className="w-10 h-10" style={{ color: '#219EBC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 whitespace-nowrap text-center">All Services</span>
                    </button>
                  )}
                </div>
              </div>

              <button 
                onClick={nextSlide}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-50"
                disabled={currentSlide === totalSlides - 1}
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-primary w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { value: '5,234', label: 'Properties' },
            { value: '10,450', label: 'Students' },
            { value: '562', label: 'Services' },
            { value: '98%', label: 'Satisfied' },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all group cursor-pointer"
            >
              <div className="text-4xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}