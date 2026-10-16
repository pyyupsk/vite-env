import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "./components/hero-section";
import { FeaturesSection } from "./components/features-section";
import { BehaviorSection } from "./components/behavior-section";
import { InstallSection } from "./components/install-section";

export function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BehaviorSection />
        <InstallSection />
      </main>
      <Footer />
    </>
  );
}
