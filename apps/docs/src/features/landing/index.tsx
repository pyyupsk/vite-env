import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from './components/hero-section'
import { FeaturesSection } from './components/features-section'
import { InstallSection } from './components/install-section'
import { ComparisonSection } from './components/comparison-section'

export function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <InstallSection />
        <ComparisonSection />
      </main>
      <Footer />
    </>
  )
}
