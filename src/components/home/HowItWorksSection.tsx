import Link from 'next/link'

export default function WhyChooseUsAndHowItWorks() {
  const features = [
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
        </svg>
      ),
      title: 'Verified Properties',
      description: 'All properties are verified and inspected for your safety'
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: 'Trusted Landlords',
      description: 'Connect with verified and trusted property owners'
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
      title: 'Easy Communication',
      description: 'Direct messaging with property owners and quick responses'
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Safe and transparent rental agreements and transactions'
    },
  ]

  const steps = [
    {
      number: 1,
      icon: '🔍',
      title: 'Search & Browse',
      description: 'Use our advanced search to find properties near your university'
    },
    {
      number: 2,
      icon: '💬',
      title: 'View Details',
      description: 'Check photos, amenities, and reviews. Compare options.'
    },
    {
      number: 3,
      icon: '📞',
      title: 'Contact Owner',
      description: 'Message owners directly. Schedule property visits.'
    },
    {
      number: 4,
      icon: '🏠',
      title: 'Move In',
      description: 'Complete booking and get your keys. Welcome home!'
    },
  ]

  const stats = [
    { value: '5,234', label: 'Properties Available' },
    { value: '10,450', label: 'Happy Students' },
    { value: '98%', label: 'Satisfaction Rate' },
  ]

  return (
    <>
      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-16">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              WHY CHOOSE US
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Because we care about your home search..
            </h2>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div style={{ color: '#219EBC' }} className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Side - Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80" 
                  alt="Modern apartment interior"
                  className="w-full h-[400px] object-cover"
                />
                {/* Trust Badge Overlay */}
                <div className="absolute bottom-0 left-0 right-0 py-4" style={{ background: 'linear-gradient(to right, #219EBC, #1a7d96)' }}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="bg-white rounded-full p-2">
                      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <span className="text-white font-bold text-lg">VERIFIED & TRUSTED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
                  {stat.value} <span style={{ color: '#219EBC' }}>+</span>
                </div>
                <div className="text-lg text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              🎯 How to Find Your Perfect Home
            </h2>
            <p className="text-xl text-gray-600">
              Follow these simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((step) => (
              <div key={step.number} className="text-center relative">
                <div 
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-lg"
                  style={{ backgroundColor: '#219EBC' }}
                >
                  {step.number}
                </div>
                <div className="text-7xl mb-6 mt-8">{step.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link 
              href="/properties" 
              className="inline-block px-10 py-4 text-lg font-semibold text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: '#219EBC' }}
            >
              Start Searching Now →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}