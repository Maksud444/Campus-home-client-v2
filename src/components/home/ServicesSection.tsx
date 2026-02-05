'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { services } from '@/data/services'
import { useStaggerCards } from '@/hooks/useGsapAnimations'
import { CheckCircle2, Star, ArrowRight, Users, Sparkles } from 'lucide-react'

export default function ServicesSection() {
  const [isMobile, setIsMobile] = useState(false)
  
  // চেক করছি ইউজার মোবাইলে আছে কি না
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // মোবাইলে অ্যানিমেশন ডিজেবল করার জন্য কন্ডিশনাল রেফারেন্স
  const cardsRef = useStaggerCards(isMobile ? [] : [services])

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            Extra Comfort
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Premium <span className="text-primary">Home Services</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Professional maintenance, cleaning, and support services to make your student life easier.
          </p>
        </div>

        {/* Services Grid */}
        <div 
          ref={!isMobile ? cardsRef : null} 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="group bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              <div className="relative z-10">
                {/* Icon Container */}
                <div className="text-5xl md:text-6xl mb-6 inline-block transform md:group-hover:scale-110 md:group-hover:-rotate-6 transition-all duration-500">
                  {service.icon}
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 md:mb-4 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {service.description}
                </p>

                {/* Feature List */}
                <div className="space-y-3 mb-8">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <CheckCircle2 size={16} className="text-primary/60" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between py-5 border-t border-slate-50 mb-6">
                  <div className="flex flex-col">
                    <div className="text-slate-900 font-bold text-lg">
                      {service.priceRange}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      <Users size={12} />
                      {service.providers}+ Experts
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-700 px-3 py-1.5 rounded-xl">
                    <Star size={14} fill="currentColor" />
                    <span className="font-black text-sm">{service.rating}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-primary font-black text-xs md:text-sm uppercase tracking-widest">
                  View Providers
                  <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}