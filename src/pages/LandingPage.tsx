import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { LandingAboutSection } from "@/components/sections/landing/LandingAboutSection";
import { LandingCategoriesSection } from "@/components/sections/landing/LandingCategoriesSection";
import { LandingFeaturesSection } from "@/components/sections/landing/LandingFeaturesSection";
import { LandingHeroSection } from "@/components/sections/landing/LandingHeroSection";
import { LandingScrollMarqueeSection } from "@/components/sections/landing/LandingScrollMarqueeSection";
import {
  LandingPageLoader,
  LANDING_LOADER_MS,
} from "@/components/landing/LandingPageLoader";

export default function LandingPage() {
  const prefersReducedMotion = useReducedMotion();
  const [showLoader, setShowLoader] = useState(!prefersReducedMotion);
  const [contentReady, setContentReady] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShowLoader(false);
      setContentReady(true);
      return;
    }

    setShowLoader(true);
    setContentReady(false);

    const revealTimer = window.setTimeout(() => {
      setContentReady(true);
    }, LANDING_LOADER_MS);

    const hideLoaderTimer = window.setTimeout(() => {
      setShowLoader(false);
    }, LANDING_LOADER_MS + 120);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(hideLoaderTimer);
    };
  }, [prefersReducedMotion]);

  return (
    <>
      <LandingPageLoader visible={showLoader} />
      {contentReady ? (
        <div className="relative bg-bg text-text">
          <LandingHeroSection />
          <LandingScrollMarqueeSection />
          <LandingFeaturesSection />
          <LandingCategoriesSection />
          <LandingAboutSection />
        </div>
      ) : null}
    </>
  );
}
