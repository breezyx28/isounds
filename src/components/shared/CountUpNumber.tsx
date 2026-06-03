import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type CountUpNumberProps = {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
  /** Shown when `value` is 0 or missing (matches existing "10+" fallback). */
  fallback?: number;
};

export function CountUpNumber({
  value,
  suffix = "+",
  className,
  duration = 1.15,
  fallback = 10,
}: CountUpNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });
  const prefersReducedMotion = useReducedMotion();
  const target = value > 0 ? value : fallback;
  const [display, setDisplay] = useState(prefersReducedMotion ? target : 0);

  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      setDisplay(target);
      return;
    }

    setDisplay(0);
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, target, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
      {suffix}
    </span>
  );
}
