import { LandingAboutSection } from "@/components/sections/landing/LandingAboutSection";
import { LandingCategoriesSection } from "@/components/sections/landing/LandingCategoriesSection";
import { LandingFeaturesSection } from "@/components/sections/landing/LandingFeaturesSection";
import { LandingHeroSection } from "@/components/sections/landing/LandingHeroSection";
import { LandingScrollMarqueeSection } from "@/components/sections/landing/LandingScrollMarqueeSection";

export default function LandingPage() {
  return (
    <div className="relative bg-bg text-text">
      <LandingHeroSection />
      <LandingScrollMarqueeSection />
      <LandingFeaturesSection />
      <LandingCategoriesSection />
      <LandingAboutSection />
    </div>
  );
}
