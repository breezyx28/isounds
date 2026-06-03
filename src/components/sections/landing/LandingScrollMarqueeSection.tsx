import { useTranslation } from "react-i18next";
import ScrollVelocity from "@/components/ui/scroll-velocity/ScrollVelocity";
import { cn } from "@/lib/utils";

function PartnershipMarqueeItem({
  partnershipLabel,
  zainAlt,
  oxygenAlt,
}: {
  partnershipLabel: string;
  zainAlt: string;
  oxygenAlt: string;
}) {
  return (
    <span className="scroll-marquee-item text-white/90">
      <img src="/logos/zain.png" alt={zainAlt} width={72} height={24} decoding="async" />
      <img src="/logos/oxygen.png" alt={oxygenAlt} width={72} height={24} decoding="async" />
      <span>{partnershipLabel}</span>
    </span>
  );
}

export function LandingScrollMarqueeSection() {
  const { t } = useTranslation();

  const partnershipStrip = (
    <PartnershipMarqueeItem
      partnershipLabel={t("landing.scrollMarquee.partnership")}
      zainAlt={t("landing.hero.partners.zain")}
      oxygenAlt={t("landing.hero.partners.oxygen")}
    />
  );

  return (
    <section
      className={cn(
        "scroll-marquee-partnership relative overflow-hidden bg-black py-2.5 md:py-3",
        "border-y border-white/10",
      )}
      aria-label={t("landing.scrollMarquee.aria")}
    >
      <ScrollVelocity
        texts={[partnershipStrip, partnershipStrip]}
        velocity={16}
        numCopies={5}
        damping={60}
        stiffness={300}
        className="text-white/90"
        parallaxClassName="parallax py-1"
        scrollerClassName="scroller text-white/90"
        velocityMapping={{ input: [0, 800], output: [0, 1.5] }}
      />
    </section>
  );
}
