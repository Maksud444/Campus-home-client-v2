'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function WhyChooseUsAndHowItWorks() {
  const { t } = useLanguage()

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('howItWorks.verified'),
      description: t('howItWorks.verifiedDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: t('howItWorks.trusted'),
      description: t('howItWorks.trustedDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: t('howItWorks.communication'),
      description: t('howItWorks.communicationDesc')
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: t('howItWorks.secure'),
      description: t('howItWorks.secureDesc')
    },
  ]

  const steps = [
    { number: 1, icon: '🔍', title: t('howItWorks.step1'), desc: t('howItWorks.step1Desc') },
    { number: 2, icon: '📄', title: t('howItWorks.step2'), desc: t('howItWorks.step2Desc') },
    { number: 3, icon: '✉️', title: t('howItWorks.step3'), desc: t('howItWorks.step3Desc') },
    { number: 4, icon: '🔑', title: t('howItWorks.step4'), desc: t('howItWorks.step4Desc') },
  ]

  return (
    <div>
      {/* WHY CHOOSE US */}
      <section className="py-10 overflow-hidden bg-white rounded-2xl mx-3 mb-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8">

            {/* Left Side: Text Content */}
            <div className="lg:w-1/2 space-y-5">
              <div>
                <span className="text-primary font-bold tracking-widest uppercase text-xs bg-primary/10 px-3 py-1.5 rounded-full">
                  {t('howItWorks.whyTitle')}
                </span>
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 mt-4 leading-tight">
                  {t('howItWorks.mainTitle')} <span className="text-primary">{t('howItWorks.mainTitleHighlight')}</span> {t('howItWorks.mainTitleEnd')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{feature.title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Image */}
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"
                  className="w-full h-72 md:h-96 object-cover"
                  alt="Modern Luxury Real Estate"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                {/* Floating Trust Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-xl flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-none">100% Verified</p>
                    <p className="text-white/70 text-xs mt-0.5">Properties are manually inspected</p>
                  </div>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-10 bg-slate-900 text-white rounded-2xl mx-3 mb-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-2">{t('howItWorks.title')}</h2>
            <p className="text-slate-400 text-sm">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector Line (Desktop Only) */}
                {idx !== 3 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}

                <div className="relative z-10 bg-slate-800/50 p-5 rounded-2xl border border-slate-700 group-hover:border-primary/50 transition-all duration-300">
                  <div className="text-xs font-black text-primary mb-2 opacity-50">STEP 0{step.number}</div>
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                  <h3 className="text-base font-bold mb-1.5">{step.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
             <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
            >
              {t('howItWorks.cta')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>

        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 skew-x-12 translate-x-1/2" />
      </section>
    </div>
  )
}
