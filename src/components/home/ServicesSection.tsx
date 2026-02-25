'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { services } from '@/data/services'
import { useStaggerCards } from '@/hooks/useGsapAnimations'
import { CheckCircle2, Star, ArrowRight, Users, Sparkles } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ServicesSection() {
  const { t } = useLanguage()
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
    <section className="py-10 bg-slate-50 rounded-2xl mx-3 mb-3 overflow-hidden">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={12} />
            {t('servicesSection.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
            {t('services.title')}
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {t('servicesSection.desc')}
          </p>
        </div>

        {/* Services Grid */}
        <div
          ref={!isMobile ? cardsRef : null}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto"
        >
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="group bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden"
            >
              <div className="relative z-10">
                {/* Icon */}
                <div className="text-3xl md:text-4xl mb-3 inline-block transform md:group-hover:scale-110 md:group-hover:-rotate-6 transition-all duration-500">
                  {service.icon}
                </div>

                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 group-hover:text-primary transition-colors">
                  {t(`service.${service.id}.name`)}
                </h3>

                <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
                  {t(`service.${service.id}.desc`)}
                </p>

                {/* Feature List */}
                <div className="space-y-1.5 mb-4">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <CheckCircle2 size={13} className="text-primary/60" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between py-3 border-t border-slate-50 mb-3">
                  <div className="flex flex-col">
                    <div className="text-slate-900 font-bold text-sm">
                      {service.priceRange}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      <Users size={11} />
                      {service.providers}+ {t('servicesSection.experts')}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-700 px-2.5 py-1 rounded-lg">
                    <Star size={12} fill="currentColor" />
                    <span className="font-black text-xs">{service.rating}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-primary font-black text-xs uppercase tracking-widest">
                  {t('services.viewProviders')}
                  <ArrowRight size={15} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}