import HeroSection from '@/components/home/HeroSection'
import ServicesSection from '@/components/home/ServicesSection'
import PropertiesSection from '@/components/home/PropertiesSection'
import LocationsSection from '@/components/home/LocationsSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PropertiesSection />
      <LocationsSection />
      <HowItWorksSection />
    </>
  )
}