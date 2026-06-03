import { InfoCircle } from "iconsax-react";
import { useTranslation } from "react-i18next";
import { AboutMagicBento } from "@/components/landing/AboutMagicBento";
import { FrostGlassChip } from "@/components/ui/frost-glass-chip";

const FEATURE_ICON_COLOR = "#7b4ab4";

export function LandingAboutSection() {
  const { t } = useTranslation();

  return (
    <section id="about" className="section-container">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <FrostGlassChip as="h2" className="gap-x-3 text-[12px] leading-none text-black/80">
          <InfoCircle size={18} color={FEATURE_ICON_COLOR} variant="Bulk" />
          {t("landing.aboutBento.chip")}
        </FrostGlassChip>

        <p className="max-w-2xl text-2xl font-bold leading-relaxed text-text">
          {t("landing.aboutBento.intro")}
        </p>

        <AboutMagicBento />
      </div>
    </section>
  );
}
