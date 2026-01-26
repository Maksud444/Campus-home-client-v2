import HeroSection from '@/components/home/HeroSection'
import PropertiesSection from '@/components/home/PropertiesSection'
import NewProjectsSection from '@/components/home/NewProjectsSection'  // ← NEW
import ServicesSection from '@/components/home/ServicesSection'
import WhyChooseUsAndHowItWorks from '@/components/home/HowItWorksSection'


export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <PropertiesSection />
      <NewProjectsSection />  {/* ← NEW: LocationsSection এর জায়গায় */}
      <ServicesSection />     {/* ← Moved down */}
      <WhyChooseUsAndHowItWorks />
    </main>
  )
}