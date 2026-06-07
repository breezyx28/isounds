import { useRef, type ReactNode } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/utils";

type LazySectionProps = {
  children: ReactNode;
  className?: string;
  placeholderClassName?: string;
  minHeight?: string;
};

export function LazySection({
  children,
  className,
  placeholderClassName,
  minHeight = "40vh",
}: LazySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "200px 0px" });

  return (
    <section ref={ref} className={cn(className)}>
      {isInView ? (
        children
      ) : (
        <div
          className={cn("w-full", placeholderClassName)}
          style={{ minHeight }}
          aria-hidden
        />
      )}
    </section>
  );
}
