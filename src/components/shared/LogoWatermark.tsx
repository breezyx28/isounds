import { cn } from "@/lib/utils";

interface LogoWatermarkProps {
  className?: string;
  opacity?: number;
}

export function LogoWatermark({ className, opacity = 0.05 }: LogoWatermarkProps) {
  const src = "/logo.png";

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn(
        "pointer-events-none absolute -bottom-8 -end-8 z-0 h-48 w-48 select-none object-contain md:h-64 md:w-64",
        className,
      )}
      style={{ opacity }}
    />
  );
}
