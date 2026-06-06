import { cn } from "@/lib/utils";

interface AnimatedIsoundLogoProps {
  className?: string;
  title?: string;
}

export function AnimatedIsoundLogo({
  className,
  title = "iSound animated logo",
}: AnimatedIsoundLogoProps) {
  return (
    <span
      className={cn(
        "group/logo inline-flex h-[1.08em] w-[1.08em] origin-center items-center justify-center align-[-0.08em] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] motion-safe:hover:scale-105",
        className,
      )}
      aria-label={title}
      role="img"
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          className="[animation:isound-logo-draw-wave_1.4s_cubic-bezier(0.4,0,0.2,1)_1.5s_forwards,isound-logo-pulse-audio_3s_ease-in-out_2.7s_infinite] stroke-[#09689b] stroke-[13] opacity-0 [stroke-dasharray:360] [stroke-dashoffset:360] [transform-origin:100px_85px] group-hover/logo:[animation-duration:1.2s,1s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[stroke-dashoffset:0]"
          d="M 42.6 133.2 A 75 75 0 1 1 157.4 133.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          className="[animation:isound-logo-draw-wave_1.2s_cubic-bezier(0.4,0,0.2,1)_1.2s_forwards,isound-logo-pulse-audio_3s_ease-in-out_2.4s_infinite] stroke-[#09689b] stroke-[13] opacity-0 [stroke-dasharray:215] [stroke-dashoffset:215] [transform-origin:100px_85px] group-hover/logo:[animation-duration:1.2s,1s] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[stroke-dashoffset:0]"
          d="M 65.5 113.9 A 45 45 0 1 1 134.5 113.9"
          strokeLinecap="round"
          fill="none"
        />
        <path
          className="origin-[100px_150px] fill-[#09689b] opacity-0 [animation:isound-logo-reveal-body_0.8s_cubic-bezier(0.2,0.8,0.2,1)_0.2s_forwards] motion-reduce:animate-none motion-reduce:opacity-100"
          d="M 66 135 C 66 120, 80 118, 100 118 C 120 118, 134 120, 134 135 C 134 170, 120 195, 100 195 C 80 195, 66 170, 66 135 Z"
        />
        <circle
          className="origin-[100px_85px] fill-[#09689b] opacity-0 [animation:isound-logo-pop-in_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.7s_forwards] motion-reduce:animate-none motion-reduce:opacity-100"
          cx="100"
          cy="85"
          r="16.5"
        />
      </svg>
    </span>
  );
}
