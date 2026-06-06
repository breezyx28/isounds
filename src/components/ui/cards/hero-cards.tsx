import { AudioLines } from "@/components/animate-ui/icons/audio-lines";
import { Microphone2, VideoCircle } from "iconsax-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { DotPattern } from "@/components/ui/dot-pattern";
import {
  ISOUNDS_SHIMMER_GRADIENT,
  NoiseBackground,
} from "@/components/ui/noise-background";
import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

/** Time to fill the bar from 0% → 100% before resetting. */
const SMALL_CARD_PROGRESS_DURATION_S = 120;

type HeroCardSmallProps = {
  title?: string;
  description?: string;
  progress?: number;
  icon?: "microphone" | "video";
  className?: string;
};

export function HeroCardSmall({
  title,
  description,
  progress = 60,
  icon = "microphone",
  className,
}: HeroCardSmallProps) {
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const isVideo = icon === "video";
  const resolvedTitle =
    title ?? t(isVideo ? "landing.hero.cards.videoTitle" : "landing.hero.cards.audioTitle");
  const resolvedDescription =
    description ??
    t(isVideo ? "landing.hero.cards.videoDescription" : "landing.hero.cards.audioDescription");

  return (
    <NoiseBackground
      borderOnly
      animating={!prefersReducedMotion}
      gradientColors={[...ISOUNDS_SHIMMER_GRADIENT]}
      containerClassName={twMerge(
        "small-hero-card aspect-square h-auto w-full rounded-[35%] lg:h-[250px] lg:w-[250px]",
        className,
      )}
      className="h-full w-full overflow-hidden rounded-[35%]"
    >
      <div className="relative flex h-full w-full flex-col justify-center gap-y-4 overflow-hidden bg-white px-4 py-6 sm:gap-y-6 sm:px-[30px] sm:py-[40px]">
        <DotPattern
          glow={!prefersReducedMotion}
          width={14}
          height={14}
          cr={1}
          className={cn(
            "text-primary/30",
            "[mask-image:radial-gradient(180px_circle_at_center,white,transparent)]",
          )}
        />
        <div className="relative z-10 flex flex-col gap-y-6">
        <div className="flex items-center justify-between">
          {icon === "microphone" ? (
            <Microphone2 className="h-8 w-8 sm:h-[42px] sm:w-[42px]" color="#7b4ab4" variant="Bold" />
          ) : (
            <VideoCircle className="h-8 w-8 sm:h-[42px] sm:w-[42px]" color="#7b4ab4" variant="Bold" />
          )}
          <AudioLines animate size={38} className="scale-90 text-primary-deep sm:scale-100" />
        </div>
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col gap-y-1">
            <span className="text-sm font-bold leading-tight text-text sm:text-lg">{resolvedTitle}</span>
            <span className="line-clamp-2 text-xs leading-tight text-text-muted sm:text-sm">{resolvedDescription}</span>
          </div>
          <div className="progress-bar flex h-[8px] w-full items-center overflow-hidden rounded-full bg-gray-300">
            <motion.div
              className="h-[6px] bg-gradient-to-r from-primary-deep to-primary-bright ltr:rounded-r-full rtl:rounded-l-full"
              initial={false}
              animate={
                prefersReducedMotion
                  ? { width: `${progress}%` }
                  : { width: ["0%", "100%"] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      duration: SMALL_CARD_PROGRESS_DURATION_S,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "loop",
                    }
              }
            />
          </div>
        </div>
        </div>
      </div>
    </NoiseBackground>
  );
}

export type HeroCardTallSlide = {
  image: string;
  title: string;
  description?: string;
};

const TALL_CAROUSEL_INTERVAL_MS = 4800;
const TALL_TEXT_FADE_MS = 380;
const TALL_IMAGE_TRANSITION_S = 0.65;

type HeroCardTallProps = {
  /** Single image; use `slides` for carousel */
  image?: string;
  slides?: HeroCardTallSlide[];
  className?: string;
};

export function HeroCardTall({ image, slides: slidesProp, className }: HeroCardTallProps) {
  const prefersReducedMotion = useReducedMotion();
  const slides = useMemo<HeroCardTallSlide[]>(() => {
    if (slidesProp?.length) return slidesProp;
    if (image) return [{ image, title: "", description: "" }];
    return [];
  }, [image, slidesProp]);

  const [index, setIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const activeIndex = slides.length > 0 ? index % slides.length : 0;
  const activeSlide = slides[activeIndex];
  const hasCaption = Boolean(activeSlide?.title || activeSlide?.description);
  const canAutoplay = slides.length > 1 && !prefersReducedMotion;

  useEffect(() => {
    if (!canAutoplay) return;

    const timer = setInterval(() => {
      setTextVisible(false);
      advanceTimeoutRef.current = setTimeout(() => {
        setIndex((current) => (current + 1) % slides.length);
        setTextVisible(true);
      }, TALL_TEXT_FADE_MS);
    }, TALL_CAROUSEL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, [canAutoplay, slides.length]);

  return (
    <NoiseBackground
      borderOnly
      animating={!prefersReducedMotion}
      gradientColors={[...ISOUNDS_SHIMMER_GRADIENT]}
      containerClassName={twMerge(
        "tall-hero-card h-full min-h-[280px] w-full max-w-none rounded-[54px] sm:min-h-[320px] sm:rounded-[70px] lg:h-[350px] lg:max-w-[300px] lg:rounded-[80px]",
        className,
      )}
      className="relative h-full w-full overflow-hidden rounded-[inherit]"
    >
      <div className="relative h-full w-full overflow-hidden">
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === activeIndex;
          return (
            <motion.img
              key={`${slide.image}-${slideIndex}`}
              src={slide.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive && !prefersReducedMotion ? 1.05 : 1,
              }}
              transition={{
                duration: TALL_IMAGE_TRANSITION_S,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          );
        })}

        {hasCaption && (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[50%] bg-gradient-to-t from-black/75 via-black/40 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-5 pt-8">
              <AnimatePresence mode="wait">
                {textVisible && activeSlide && (
                  <motion.div
                    key={`caption-${activeIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: TALL_TEXT_FADE_MS / 1000, ease: "easeInOut" }}
                    className="space-y-1"
                  >
                    {activeSlide.title ? (
                      <p className="text-sm font-semibold leading-snug text-white">
                        {activeSlide.title}
                      </p>
                    ) : null}
                    {activeSlide.description ? (
                      <p className="text-xs leading-relaxed text-white/85">
                        {activeSlide.description}
                      </p>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </NoiseBackground>
  );
}
