import { useMemo } from "react";
import { ArrowRight } from "iconsax-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslation } from "react-i18next";
import { HeroCardSmall, HeroCardTall } from "@/components/ui/cards/hero-cards";
import { HeroCompanyCards } from "@/components/ui/cards/hero-company-cards";
import { HeroSilkBackground } from "@/components/ui/silk/HeroSilkBackground";
import { GradientBorderButton } from "@/components/ui/buttons/gradient-border-button";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { AnimatedIsoundFullLogo } from "@/components/shared/AnimatedIsoundFullLogo";

const EASE = [0.22, 1, 0.36, 1] as const;
const GAP = 0.02;

const DURATIONS = {
  logo: 0.28,
  headline: 0.65,
  subcopy: 0.28,
  partner: 0.32,
  subscribe: 0.32,
  card: 0.4,
} as const;

function buildHeroDelays(reduced: boolean) {
  if (reduced) {
    return {
      logo: 0,
      headline: 0,
      subcopy: 0.08,
      partnerZain: 0.12,
      partnerOxygen: 0.16,
      subscribe: 0.2,
      cardTallLeft: 0.24,
      cardSmallTop: 0.28,
      cardSmallBottom: 0.32,
      cardTallRight: 0.36,
    };
  }

  let cursor = 0;
  const logo = cursor;
  cursor += DURATIONS.logo + GAP;

  const headline = cursor;
  cursor += DURATIONS.headline + GAP;

  const subcopy = cursor;
  cursor += DURATIONS.subcopy + GAP;

  const partnerZain = cursor;
  cursor += DURATIONS.partner + GAP;

  const partnerOxygen = cursor;
  cursor += DURATIONS.partner + GAP;

  const subscribe = cursor;
  cursor += DURATIONS.subscribe + GAP;

  const cardTallLeft = cursor;
  cursor += DURATIONS.card + GAP;

  const cardSmallTop = cursor;
  cursor += DURATIONS.card + GAP;

  const cardSmallBottom = cursor;
  cursor += DURATIONS.card + GAP;

  const cardTallRight = cursor;

  return {
    logo,
    headline,
    subcopy,
    partnerZain,
    partnerOxygen,
    subscribe,
    cardTallLeft,
    cardSmallTop,
    cardSmallBottom,
    cardTallRight,
  };
}

const fadeUp = (delay: number, duration: number, reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { delay, duration, ease: reduced ? "easeOut" : EASE },
  },
});

const fadeUpCard = (delay: number, reduced: boolean): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : -36 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: reduced ? 0.25 : DURATIONS.card,
      ease: reduced ? "easeOut" : EASE,
    },
  },
});

export function LandingHeroSection() {
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const delays = useMemo(
    () => buildHeroDelays(Boolean(prefersReducedMotion)),
    [prefersReducedMotion],
  );

  return (
    <section
      id="hero"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-bg"
    >
      <HeroSilkBackground />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-7xl items-center px-4 pb-8 pt-8 sm:min-h-[calc(100dvh-4rem)] md:px-8 lg:min-h-[100dvh] lg:pt-16 xl:px-16">
        <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <motion.div
            className="hero-content flex w-full max-w-[600px] flex-col items-start justify-between gap-6 sm:gap-8 lg:max-h-[700px] lg:min-h-[560px] lg:gap-10"
            initial="hidden"
            animate="show"
          >
            <h1 className="w-full max-w-[min(100%,330px)] text-[clamp(3.25rem,17vw,4.5rem)] font-black uppercase leading-none lg:max-w-[300px] lg:text-[72px]">
              <motion.span
                className="inline-block"
                variants={fadeUp(delays.logo, DURATIONS.logo, Boolean(prefersReducedMotion))}
              >
                <AnimatedIsoundFullLogo
                  direction="ltr"
                  className="hover:scale-none"
                  gap={8}
                  size="min(100%, 400px)"
                  letterSpacing={10}
                  disableHoverEffect
                />
              </motion.span>
              <br />
              <DiaTextReveal
                className="text-[clamp(2.5rem,14vw,3.75rem)] !text-black font-black uppercase leading-none lg:text-[60px]"
                colors={["#9f67db", "#b786ea", "#4079ff", "#b786ea", "#9f67db"]}
                text={t("landing.hero.headline")}
                textColor="black"
                delay={delays.headline}
                duration={DURATIONS.headline}
                startOnView={false}
              />
            </h1>
            <motion.span
              className="max-w-[34ch] text-[13px] leading-relaxed text-black/70 sm:text-[14px]"
              variants={fadeUp(
                delays.subcopy,
                DURATIONS.subcopy,
                Boolean(prefersReducedMotion),
              )}
            >
              {t("landing.hero.subcopy")}
            </motion.span>
            <div className="w-full">
              <div className="grid w-full grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:gap-6">
                <motion.div
                  variants={fadeUp(
                    delays.partnerZain,
                    DURATIONS.partner,
                    Boolean(prefersReducedMotion),
                  )}
                >
                  <HeroCompanyCards
                    className="bg-purple-700"
                    icon="/logos/zain.png"
                    name={t("landing.hero.partners.zain")}
                    title={t("landing.hero.sponsoredBy")}
                  />
                </motion.div>
                <motion.div
                  variants={fadeUp(
                    delays.partnerOxygen,
                    DURATIONS.partner,
                    Boolean(prefersReducedMotion),
                  )}
                >
                  <HeroCompanyCards
                    icon="/logos/oxygen.png"
                    name={t("landing.hero.partners.oxygen")}
                    title={t("landing.hero.developedBy")}
                  />
                </motion.div>
                <motion.div
                  className="col-span-2"
                  variants={fadeUp(
                    delays.subscribe,
                    DURATIONS.subscribe,
                    Boolean(prefersReducedMotion),
                  )}
                >
                  <GradientBorderButton className="group relative px-6 py-4 text-[12px] font-extrabold uppercase leading-none tracking-wider sm:px-8 sm:py-5 sm:text-[14px]">
                    <div className="flex items-center gap-2">
                      {t("nav.subscribe")}
                      <ArrowRight
                        size={16}
                        color="purple"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </GradientBorderButton>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="w-full max-w-[500px] flex-1 lg:max-h-[700px]">
            <motion.div
              className="grid grid-cols-2 gap-4 sm:gap-6"
              initial="hidden"
              animate="show"
            >
              <motion.div
                variants={fadeUpCard(delays.cardTallLeft, Boolean(prefersReducedMotion))}
                className="row-span-2 col-start-1 row-start-1"
              >
                <HeroCardTall
                  slides={[
                    {
                      image: "/assets/images/microphone-1.jpg",
                      title: t("landing.hero.tallSlides.mic1.title"),
                      description: t(
                        "landing.hero.tallSlides.mic1.description",
                      ),
                    },
                    {
                      image: "/assets/images/microphone-2.jpg",
                      title: t("landing.hero.tallSlides.mic2.title"),
                      description: t(
                        "landing.hero.tallSlides.mic2.description",
                      ),
                    },
                  ]}
                />
              </motion.div>
              <motion.div
                variants={fadeUpCard(delays.cardSmallTop, Boolean(prefersReducedMotion))}
              >
                <HeroCardSmall progress={40} icon="microphone" />
              </motion.div>
              <motion.div
                variants={fadeUpCard(delays.cardSmallBottom, Boolean(prefersReducedMotion))}
              >
                <HeroCardSmall icon="video" />
              </motion.div>
              <motion.div
                variants={fadeUpCard(delays.cardTallRight, Boolean(prefersReducedMotion))}
                className="row-span-2 col-start-2 row-start-2"
              >
                <HeroCardTall
                  slides={[
                    {
                      image: "/logos/zain-logo.png",
                      title: t("landing.hero.tallSlides.partner.title"),
                      description: t(
                        "landing.hero.tallSlides.partner.description",
                      ),
                    },
                  ]}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
