import { ArrowRight } from "iconsax-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslation } from "react-i18next";
import { HeroCardSmall, HeroCardTall } from "@/components/ui/cards/hero-cards";
import { HeroCompanyCards } from "@/components/ui/cards/hero-company-cards";
import { HeroSilkBackground } from "@/components/ui/silk/HeroSilkBackground";
import { GradientBorderButton } from "@/components/ui/buttons/gradient-border-button";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { AnimatedIsoundFullLogo } from "@/components/shared/AnimatedIsoundFullLogo";

const heroCardsStaggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.25,
    },
  },
};

const heroCardsStaggerItem: Variants = {
  hidden: { opacity: 0, y: -36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
  },
};

const heroCardsStaggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const HERO_COPY_DELAY_S = 1;

export function LandingHeroSection() {
  const { t } = useTranslation("common");
  const prefersReducedMotion = useReducedMotion();
  const heroCopyDelay = prefersReducedMotion ? 0 : HERO_COPY_DELAY_S;
  const heroCardItemVariants: Variants = prefersReducedMotion
    ? heroCardsStaggerItemReduced
    : heroCardsStaggerItem;

  return (
    <section
      id="hero"
      className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-bg"
    >
      <HeroSilkBackground />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl items-center px-4 pb-8 pt-16 md:px-8 xl:px-16">
        <div className="flex w-full flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="hero-content flex w-full max-w-[600px] flex-col items-start justify-between gap-10 lg:max-h-[700px] lg:min-h-[560px]">
            <h1 className="max-w-[300px] text-[72px] font-black uppercase leading-none">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: heroCopyDelay,
                  duration: 0.45,
                  ease: "easeOut",
                }}
              >
                <AnimatedIsoundFullLogo
                  direction="ltr"
                  className="hover:scale-none"
                  gap={8}
                  size={400}
                  letterSpacing={10}
                  disableHoverEffect
                />
              </motion.span>
              <br />
              <DiaTextReveal
                className="text-[60px] font-black uppercase leading-none"
                colors={["#9f67db", "#b786ea", "#4079ff", "#b786ea", "#9f67db"]}
                text={t("landing.hero.headline")}
                textColor="var(--color-text)"
                delay={heroCopyDelay}
                startOnView={true}
              />
            </h1>
            <motion.span
              className="max-w-[300px] text-[14px] text-black/70"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: heroCopyDelay + 0.15,
                duration: 0.5,
                ease: "easeOut",
              }}
            >
              {t("landing.hero.subcopy")}
            </motion.span>
            <div className="w-full">
              <div className="grid w-full grid-cols-2 grid-rows-2 gap-6">
                <HeroCompanyCards
                  className="bg-purple-700"
                  icon="/logos/zain.png"
                  name={t("landing.hero.partners.zain")}
                  title={t("landing.hero.sponsoredBy")}
                />
                <HeroCompanyCards
                  icon="/logos/oxygen.png"
                  name={t("landing.hero.partners.oxygen")}
                  title={t("landing.hero.developedBy")}
                />
                <div className="col-span-2">
                  <GradientBorderButton className="group relative px-8 py-5 text-[14px] font-extrabold uppercase leading-none tracking-wider">
                    <div className="flex items-center gap-2">
                      {t("nav.subscribe")}
                      <ArrowRight
                        size={16}
                        color="purple"
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </GradientBorderButton>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[500px] flex-1 lg:max-h-[700px]">
            <motion.div
              className="grid grid-cols-2 gap-6"
              variants={heroCardsStaggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
            >
              <motion.div
                variants={heroCardItemVariants}
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
              <motion.div variants={heroCardItemVariants}>
                <HeroCardSmall progress={40} icon="microphone" />
              </motion.div>
              <motion.div variants={heroCardItemVariants}>
                <HeroCardSmall icon="video" />
              </motion.div>
              <motion.div
                variants={heroCardItemVariants}
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
