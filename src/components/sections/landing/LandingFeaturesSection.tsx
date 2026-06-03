import { Category, Mobile, PlayCircle } from "iconsax-react";
import { useTranslation } from "react-i18next";
import { FeaturesBgIcon } from "@/components/landing/FeaturesBgIcon";
import { FeaturesCards } from "@/components/ui/cards/features-cards";
import { FrostGlassChip } from "@/components/ui/frost-glass-chip";

const FEATURE_ICON_COLOR = "#7b4ab4";

export function LandingFeaturesSection() {
  const { t } = useTranslation();

  return (
    <section id="features" className="section-container">
      <div className="relative flex h-[80dvh] w-full flex-col justify-center gap-6 overflow-hidden rounded-2xl bg-purple-200 p-10">
        <FeaturesBgIcon />
        <FrostGlassChip as="h2" className="relative z-10 gap-x-3 text-[12px] leading-none text-black/80">
          <Category size={18} color={FEATURE_ICON_COLOR} variant="Bulk" />
          {t("landing.features.chip")}
        </FrostGlassChip>

        <p className="relative z-10 mt-8 max-w-2xl text-2xl font-bold leading-relaxed text-black/80">
          {t("landing.subtitle")}
        </p>

        <div className="features-cards relative z-10 mt-auto grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          <FeaturesCards
            icon={<Category size={22} color={FEATURE_ICON_COLOR} variant="Bulk" />}
            title={t("landing.cards.oneTitle")}
            description={t("landing.cards.oneBody")}
          />
          <FeaturesCards
            icon={<PlayCircle size={22} color={FEATURE_ICON_COLOR} variant="Bulk" />}
            title={t("landing.cards.twoTitle")}
            description={t("landing.cards.twoBody")}
          />
          <FeaturesCards
            icon={<Mobile size={22} color={FEATURE_ICON_COLOR} variant="Bulk" />}
            title={t("landing.cards.threeTitle")}
            description={t("landing.cards.threeBody")}
          />
        </div>
      </div>
    </section>
  );
}
