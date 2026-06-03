import { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const BAR_COUNT = 16;
const BAR_DELAYS = Array.from({ length: BAR_COUNT }, (_, i) => i * 0.06);

interface AudioWaveBarsProps {
  isPlaying: boolean;
  className?: string;
}

function AudioWaveBarsInner({ isPlaying, className }: AudioWaveBarsProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn("flex h-8 items-end justify-center gap-0.5", className)}
      aria-hidden
    >
      {BAR_DELAYS.map((delay, index) => (
        <motion.span
          key={index}
          className={cn(
            "w-1 origin-bottom rounded-full",
            isPlaying ? "bg-primary" : "bg-primary/35",
          )}
          initial={{ scaleY: 0.25 }}
          animate={
            reduceMotion
              ? { scaleY: isPlaying ? 0.65 : 0.25 }
              : isPlaying
                ? { scaleY: [0.25, 1, 0.35, 0.85, 0.25] }
                : { scaleY: 0.25 }
          }
          transition={
            reduceMotion
              ? { duration: 0.2 }
              : {
                  duration: 1.1,
                  repeat: isPlaying ? Infinity : 0,
                  delay,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
          style={{ height: "100%" }}
        />
      ))}
    </div>
  );
}

export const AudioWaveBars = memo(AudioWaveBarsInner);
