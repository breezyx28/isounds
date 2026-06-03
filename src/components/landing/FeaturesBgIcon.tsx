import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function FeaturesBgIcon() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.img
      src="/logos/isounds-icon-primary.svg"
      alt=""
      aria-hidden
      className="pointer-events-none absolute top-[-5%] right-[-50%] h-full w-full object-contain select-none"
      initial={
        prefersReducedMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 1.1,
              x: "12%",
              rotate: -10,
              filter: "blur(16px)",
            }
      }
      whileInView={
        prefersReducedMotion
          ? { opacity: 0.5 }
          : {
              opacity: 0.5,
              scale: 1.5,
              x: 0,
              rotate: 0,
              filter: "blur(0px)",
            }
      }
      viewport={{ once: true, amount: 0.25, margin: "-80px" }}
      transition={
        prefersReducedMotion
          ? { duration: 0.35, ease: "easeOut" }
          : { duration: 1.15, ease: EASE }
      }
    />
  );
}
