import Link from 'next/link'

export default function WhyChooseUsAndHowItWorks() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Verified Properties',
      description: 'All properties are verified and inspected for your safety'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Trusted Landlords',
      description: 'Connect with verified and trusted property owners'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Easy Communication',
      description: 'Direct messaging with property owners and quick responses'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Safe and transparent rental agreements and transactions'
    },
  ]

  const steps = [
    { number: 1, icon: '🔍', title: 'Search', desc: 'Find properties near your university.' },
    { number: 2, icon: '📄', title: 'Details', desc: 'Check photos, amenities, and reviews.' },
    { number: 3, icon: '✉️', title: 'Contact', desc: 'Message owners and schedule visits.' },
    { number: 4, icon: '🔑', title: 'Move In', desc: 'Complete booking and get your keys.' },
  ]

  return (
    <div className="bg-white">
      {/* WHY CHOOSE US - MODERN SPLIT DESIGN */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Side: Text Content */}
            <div className="lg:w-1/2 space-y-8">
              <div>
                <span className="text-primary font-bold tracking-widest uppercase text-sm bg-primary/10 px-4 py-2 rounded-full">
                  Why Choose Us
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-6 leading-tight">
                  We care about your <span className="text-primary">home search</span> experience
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side: Visual Image & Stats */}
            <div className="lg:w-1/2 relative">
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" 
                  className="w-full h-[600px] object-cover" 
                  alt="Modern Luxury Real Estate" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                
                {/* Floating Trust Badge */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg leading-none">100% Verified</p>
                    <p className="text-white/70 text-sm mt-1">Properties are manually inspected</p>
                  </div>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - TIMELINE DESIGN */}
      <section className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 mb-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-4">How it Works?</h2>
            <p className="text-slate-400">Follow these 4 simple steps to find and move into your perfect student home in Egypt.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector Line (Desktop Only) */}
                {idx !== 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-[2px] bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}
                
                <div className="relative z-10 bg-slate-800/50 p-8 rounded-3xl border border-slate-700 group-hover:border-primary/50 transition-all duration-300">
                  <div className="text-sm font-black text-primary mb-4 opacity-50">STEP 0{step.number}</div>
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
             <Link 
              href="/properties" 
              className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20"
            >
              Start Searching Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 skew-x-12 translate-x-1/2" />
      </section>
    </div>
  )
}