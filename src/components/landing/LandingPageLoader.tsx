import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AnimatedIsoundLogo } from "@/components/shared/AnimatedIsoundLogo";

/** Main logo draw finishes ~2.9s; keep loader brief before hero sequence. */
export const LANDING_LOADER_MS = 2400;

type LandingPageLoaderProps = {
  visible: boolean;
};

export function LandingPageLoader({ visible }: LandingPageLoaderProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="landing-page-loader"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={
            prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: "easeOut" }
          }
          aria-busy="true"
          aria-label="Loading iSounds"
          role="status"
        >
          <span className="inline-flex text-[7.5rem] leading-none">
            <AnimatedIsoundLogo title="iSounds" />
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
