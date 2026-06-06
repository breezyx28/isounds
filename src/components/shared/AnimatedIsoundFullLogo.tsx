import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

type LogoDirection = "ltr" | "rtl";

const ICON_SIZE = 200;
const DEFAULT_WORDMARK = "iSOUNDS";

function toCssSize(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

function getLetterAdvance(letter: string, letterSpacing: number, wordSpacing: number) {
  if (letter === " ") return 34 + wordSpacing;
  if (letter === "i" || letter === "I" || letter === "l") return 51 + letterSpacing;
  return 64 + letterSpacing;
}

function getLetterPositions(word: string, letterSpacing: number, wordSpacing: number) {
  let cursor = 0;

  return Array.from(word).map((letter) => {
    const x = cursor;
    cursor += getLetterAdvance(letter, letterSpacing, wordSpacing);
    return { letter, x };
  });
}

interface AnimatedIsoundFullLogoProps {
  className?: string;
  disableHoverEffect?: boolean;
  direction?: LogoDirection;
  gap?: number;
  iconColor?: string;
  letterSpacing?: number;
  maxWidth?: number | string;
  size?: number | string;
  title?: string;
  word?: string;
  wordColor?: string;
  wordSpacing?: number;
}

export function AnimatedIsoundFullLogo({
  className,
  disableHoverEffect = false,
  direction = "ltr",
  gap = 18,
  iconColor = "#005A8C",
  letterSpacing = -2,
  maxWidth = "100%",
  size = "4.15em",
  title = "iSOUNDS animated logo",
  word = DEFAULT_WORDMARK,
  wordColor = "#832B85",
  wordSpacing = 0,
}: AnimatedIsoundFullLogoProps) {
  const letters = getLetterPositions(word, letterSpacing, wordSpacing);
  const wordWidth =
    letters.length > 0
      ? letters[letters.length - 1].x +
        getLetterAdvance(letters[letters.length - 1].letter, letterSpacing, wordSpacing)
      : 0;
  const viewBoxWidth = Math.max(ICON_SIZE + gap + wordWidth + 8, ICON_SIZE);
  const isRtl = direction === "rtl";
  const iconOffset = isRtl ? wordWidth + gap : 0;
  const textOffset = isRtl ? 0 : ICON_SIZE + gap;
  const slideClass = isRtl
    ? "[animation:isound-logo-slide-letter-rtl_0.6s_cubic-bezier(0.2,0.8,0.2,1)_forwards]"
    : "[animation:isound-logo-slide-letter_0.6s_cubic-bezier(0.2,0.8,0.2,1)_forwards]";
  const style = {
    direction,
    maxWidth: toCssSize(maxWidth),
    width: toCssSize(size),
  } satisfies CSSProperties;

  return (
    <span
      className={cn(
        "group/full-logo inline-flex origin-left items-center align-[-0.08em] transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
        !disableHoverEffect && "motion-safe:hover:scale-[1.03]",
        className,
      )}
      aria-label={title}
      dir={direction}
      role="img"
      style={style}
    >
      <svg
        className="block h-auto w-full overflow-visible"
        viewBox={`0 0 ${viewBoxWidth} 200`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g transform={`translate(${iconOffset} 0)`}>
          <path
            className={cn(
              "[animation:isound-logo-draw-wave_1.4s_cubic-bezier(0.4,0,0.2,1)_1.5s_forwards,isound-logo-pulse-audio_3s_ease-in-out_2.7s_infinite] stroke-[13] opacity-0 [stroke-dasharray:360] [stroke-dashoffset:360] [transform-origin:100px_85px] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[stroke-dashoffset:0]",
              !disableHoverEffect && "group-hover/full-logo:[animation-duration:1.2s,1s]",
            )}
            d="M 42.6 133.2 A 75 75 0 1 1 157.4 133.2"
            stroke={iconColor}
            strokeLinecap="round"
            fill="none"
          />
          <path
            className={cn(
              "[animation:isound-logo-draw-wave_1.2s_cubic-bezier(0.4,0,0.2,1)_1.2s_forwards,isound-logo-pulse-audio_3s_ease-in-out_2.4s_infinite] stroke-[13] opacity-0 [stroke-dasharray:215] [stroke-dashoffset:215] [transform-origin:100px_85px] motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:[stroke-dashoffset:0]",
              !disableHoverEffect && "group-hover/full-logo:[animation-duration:1.2s,1s]",
            )}
            d="M 65.5 113.9 A 45 45 0 1 1 134.5 113.9"
            stroke={iconColor}
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="origin-[100px_150px] opacity-0 [animation:isound-logo-reveal-body_0.8s_cubic-bezier(0.2,0.8,0.2,1)_0.2s_forwards] motion-reduce:animate-none motion-reduce:opacity-100"
            d="M 66 135 C 66 120, 80 118, 100 118 C 120 118, 134 120, 134 135 C 134 170, 120 195, 100 195 C 80 195, 66 170, 66 135 Z"
            fill={iconColor}
          />
          <circle
            className="origin-[100px_85px] opacity-0 [animation:isound-logo-pop-in_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.7s_forwards] motion-reduce:animate-none motion-reduce:opacity-100"
            cx="100"
            cy="85"
            r="16.5"
            fill={iconColor}
          />
        </g>
        <g
          fill={wordColor}
          fontFamily="Nunito, ui-sans-serif, system-ui, sans-serif"
          fontSize="104"
          fontWeight="800"
          letterSpacing={letterSpacing}
          transform={`translate(${textOffset} 0)`}
        >
          {letters.map(({ letter, x }, index) => (
            <text
              key={`${letter}-${index}`}
              className={cn(
                "opacity-0 motion-reduce:animate-none motion-reduce:opacity-100",
                slideClass,
              )}
              style={{ animationDelay: `${1.7 + index * 0.1}s` }}
              x={x}
              y="135"
            >
              {letter === " " ? "\u00A0" : letter}
            </text>
          ))}
        </g>
      </svg>
    </span>
  );
}
