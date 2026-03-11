'use client'

import { useState } from 'react'
import Link from 'next/link'
import { services } from '@/data/services'
import { serviceProviders, serviceLocations } from '@/data/serviceProviders'
import { Search, Star, Users, MapPin, ArrowRight, Phone, CheckCircle, Shield, Clock, Award } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function ServicesPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get top-rated providers
  const topProviders = [...serviceProviders]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary via-primary-dark to-gray-900 text-white pt-24 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Shield className="w-4 h-4" />
              {t('servicesPage.verified')}
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
              {t('servicesPage.heroTitle')}
            </h1>
            <p className="text-lg text-white/80 mb-8">
              {t('servicesPage.heroSubtitle')}
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('servicesPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold">12+</div>
              <div className="text-xs text-white/70 font-medium mt-1">{t('servicesPage.providers')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold">6</div>
              <div className="text-xs text-white/70 font-medium mt-1">{t('servicesPage.categories')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold">4.8</div>
              <div className="text-xs text-white/70 font-medium mt-1">{t('servicesPage.avgRating')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl font-extrabold">24/7</div>
              <div className="text-xs text-white/70 font-medium mt-1">{t('servicesPage.availability')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('servicesPage.ourServices')}</h2>
          <p className="text-gray-500">{t('servicesPage.ourServicesDesc')}</p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t('servicesPage.allServices')}
          </button>
          {services.map(service => (
            <button
              key={service.id}
              onClick={() => setSelectedCategory(service.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === service.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {service.icon} {t(`service.${service.id}.name`)}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Service Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-sm text-gray-800">{service.rating}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                  {t(`service.${service.id}.name`)}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">
                  {t(`service.${service.id}.desc`)}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {service.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-primary/60 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{service.priceRange}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {service.providers}+ {t('servicesPage.providers2')}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                  {t('servicesPage.view')}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('servicesPage.noServices')}</h3>
            <p className="text-gray-500 mb-4">{t('servicesPage.ourServicesDesc')}</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}
              className="text-primary font-semibold hover:underline"
            >
              {t('servicesPage.clearSearch')}
            </button>
          </div>
        )}
      </div>

      {/* Top Rated Providers */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{t('servicesPage.topProviders')}</h2>
              <p className="text-gray-500 text-sm">{t('servicesPage.topProvidersDesc')}</p>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-700">{t('servicesPage.verified')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-gray-50 rounded-2xl p-5 hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{provider.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-800">{provider.rating}</span>
                      </div>
                      {provider.available && (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {t('servicesPage.available')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{provider.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium capitalize">
                    {provider.service}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {provider.location}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {provider.experience}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="font-bold text-gray-900 text-sm">{provider.price}</span>
                  <Link
                    href={`/services/${provider.service}/${provider.location.toLowerCase().replace(/ /g, '-')}`}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('servicesPage.serviceAreas')}</h2>
          <p className="text-gray-500">{t('servicesPage.serviceAreasDesc')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {serviceLocations.map((location) => (
            <div
              key={location.name}
              className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{location.name}</h3>
              <p className="text-xs text-gray-500">{location.count} {t('servicesPage.providers2')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('servicesPage.howItWorks')}</h2>
            <p className="text-gray-500">{t('servicesPage.howItWorksDesc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <div className="text-sm font-bold text-primary mb-2">1</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('servicesPage.step1')}</h3>
              <p className="text-sm text-gray-500">{t('servicesPage.step1Desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <div className="text-sm font-bold text-primary mb-2">2</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('servicesPage.step2')}</h3>
              <p className="text-sm text-gray-500">{t('servicesPage.step2Desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-primary" />
              </div>
              <div className="text-sm font-bold text-primary mb-2">3</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('servicesPage.step3')}</h3>
              <p className="text-sm text-gray-500">{t('servicesPage.step3Desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('servicesPage.needHelp')}</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            {t('servicesPage.needHelpDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              {t('servicesPage.backToHome')}
            </Link>
            <Link
              href="/properties"
              className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              {t('servicesPage.browseProperties')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
