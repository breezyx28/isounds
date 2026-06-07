import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { LandingAboutSection } from "@/components/sections/landing/LandingAboutSection";
import { LandingCategoriesSection } from "@/components/sections/landing/LandingCategoriesSection";
import { LandingFeaturesSection } from "@/components/sections/landing/LandingFeaturesSection";
import { LandingHeroSection } from "@/components/sections/landing/LandingHeroSection";
import { LandingScrollMarqueeSection } from "@/components/sections/landing/LandingScrollMarqueeSection";
import { LandingPageLoader } from "@/components/landing/LandingPageLoader";
import { useTopicChipCounts } from "@/hooks/useTopicChipCounts";

const LANDING_SEEN_KEY = "landing_seen";
const LOADER_OVERLAY_MS = 400;

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [showLoader, setShowLoader] = useState(false);
  useTopicChipCounts();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const seen = sessionStorage.getItem(LANDING_SEEN_KEY);
    if (seen) return;

    setShowLoader(true);
    sessionStorage.setItem(LANDING_SEEN_KEY, "1");

    const hideTimer = window.setTimeout(() => {
      setShowLoader(false);
    }, LOADER_OVERLAY_MS);

    return () => window.clearTimeout(hideTimer);
  }, [prefersReducedMotion]);

  return (
    <>
      <LandingPageLoader visible={showLoader} />
      <div className="relative bg-bg text-text">
        <LandingHeroSection />
        <LandingScrollMarqueeSection />
        <LandingFeaturesSection />
        <LandingCategoriesSection />
        <LandingAboutSection />
      </div>
    </>
  );
}
