import { LandingAboutSection } from "@/components/sections/landing/LandingAboutSection";
import { LandingCategoriesSection } from "@/components/sections/landing/LandingCategoriesSection";
import { LandingFeaturesSection } from "@/components/sections/landing/LandingFeaturesSection";
import { LandingHeroSection } from "@/components/sections/landing/LandingHeroSection";

export default function LandingPage() {
  return (
    <div className="relative bg-bg text-text">
      <LandingHeroSection />
      <LandingFeaturesSection />
      <LandingCategoriesSection />
      <LandingAboutSection />
    </div>
  );
}
