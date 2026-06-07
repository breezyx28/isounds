import { useReducedMotion } from "motion/react";
import { NoiseBackground } from "../noise-background";
import { ZAIN_DSP } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function GradientBorderButton({ children, className }: { children: React.ReactNode, className?: string }) {
    const prefersReducedMotion = useReducedMotion();
  return (
    <NoiseBackground
            animating={!prefersReducedMotion}
            containerClassName="hidden md:block w-fit rounded-full"
            className="rounded-full"
          >
            <a
              href={ZAIN_DSP}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex h-9 items-center justify-center rounded-full px-5 text-label font-semibold",
                "bg-gradient-to-r from-purple-200 via-purple-100 to-purple-200 text-primary-deep",
                "shadow-[0px_2px_0px_0px_#f6f5fa_inset,0px_0.5px_1px_0px_#ddd7ed]",
                "transition-all duration-100 hover:text-primary active:scale-[0.98]",
                className
              )}
            >
             {children}
            </a>
          </NoiseBackground>
  );
}