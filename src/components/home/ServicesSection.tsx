'use client'

import Link from 'next/link'
import { services } from '@/data/services'
import { useStaggerCards } from '@/hooks/useGsapAnimations'
import { CheckCircle2, Star, ArrowRight, Users, Sparkles } from 'lucide-react'

export default function ServicesSection() {
  const cardsRef = useStaggerCards([services])

  return (
    <section className="py-24 bg-slate-50">
      <div className="container mx-auto px-6">
        
        {/* Header - Centered & Refined */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={14} />
            Extra Comfort
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Premium <span className="text-primary">Home Services</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            Professional maintenance, cleaning, and support services to make your student life easier and worry-free.
          </p>
        </div>

        {/* Services Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 relative overflow-hidden"
            >
              {/* Animated Background Shape */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-primary/5 transition-colors duration-500 -z-0" />

              <div className="relative z-10">
                {/* Icon Container */}
                <div className="text-6xl mb-6 inline-block transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 grayscale-[0.5] group-hover:grayscale-0">
                  {service.icon}
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">
                  {service.description}
                </p>

                {/* Feature List - Styled with CheckCircle */}
                <div className="space-y-3 mb-8">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm font-semibold text-slate-600">
                      <CheckCircle2 size={16} className="text-primary/60" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Meta Info: Rating & Providers */}
                <div className="flex items-center justify-between py-6 border-t border-slate-50 mb-6">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-lg">
                      {service.priceRange}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-bold uppercase tracking-tighter">
                      <Users size={12} />
                      {service.providers}+ Experts Available
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-600 px-3 py-1.5 rounded-xl border border-yellow-400/20">
                    <Star size={14} fill="currentColor" />
                    <span className="font-black text-sm">{service.rating}</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="flex items-center gap-2 text-primary font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                  View All Providers
                  <ArrowRight size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Support CTA */}
        <div className="mt-20 p-8 rounded-[2rem] bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">Need a custom service?</h4>
                <p className="text-slate-400">Our team can help you find specialized providers for your unique needs.</p>
            </div>
            <Link href="/contact" className="relative z-10 px-8 py-4 bg-primary hover:bg-white hover:text-primary text-white rounded-2xl font-bold transition-all whitespace-nowrap">
                Contact Concierge
            </Link>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    </section>
  )
}