import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { Silk } from "./Silk";

export interface HeroSilkBackgroundProps {
  className?: string;
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

/** Soft silk wash on light backgrounds — transparent canvas, edge dissolve via mask only. */
export function HeroSilkBackground({
  className,
  speed = 4.4,
  scale = 0.55,
  color = "#e4cff5",
  noiseIntensity = 0.9,
  rotation = 1.14,
}: HeroSilkBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 size-full bg-primary/[0.08]",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 size-full min-h-[100dvh] min-w-full",
        className,
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 size-full min-h-[100dvh]"
        style={{
          WebkitMaskImage:
            "radial-gradient(ellipse 92% 88% at 50% 48%, #000 30%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse 92% 88% at 50% 48%, #000 30%, transparent 75%)",
        }}
      >
        <Silk
          speed={speed}
          scale={scale}
          color={color}
          noiseIntensity={noiseIntensity}
          rotation={rotation}
          className="size-full min-h-[100dvh]"
        />
      </div>
    </div>
  );
}
