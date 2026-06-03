import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MagicBento } from "@/components/ui/magic-bento/MagicBento";

const CARD_KEYS = [
  "local",
  "mission",
  "zain",
  "discovery",
  "listen",
  "language",
] as const;

const CARD_COLORS = ["#f1eef9", "#ffffff", "#f1eef9", "#ffffff", "#f1eef9", "#ffffff"];

const CARD_IMAGES: Record<(typeof CARD_KEYS)[number], string> = {
  local: "/assets/images/podcasts-covers/1000437924.jpg",
  mission: "/assets/images/posters/sound-waves-bars.png",
  discovery: "/assets/images/podcasts-covers/1000437924.jpg",
  listen: "/assets/images/posters/play-button.png",
  zain: "/assets/images/zain-cover.webp",
  language:
    "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80",
};

const podcastCover = (filename: string) =>
  `/assets/images/podcasts-covers/${encodeURIComponent(filename)}`;

/** Discovery card slideshow — 5 podcast covers only */
const DISCOVERY_SLIDES = [
  podcastCover("1000437924.jpg"),
  podcastCover("file_5(2).jpg"),
  podcastCover("Today-We-Celebrate.png"),
  podcastCover("البدوية.png"),
  podcastCover("طرائف العرب.png"),
];

const ISOUNDS_GLOW = "159, 103, 219";

export function AboutMagicBento() {
  const { t } = useTranslation();

  const cards = useMemo(
    () =>
      CARD_KEYS.map((key, index) => ({
        color: CARD_COLORS[index],
        label: t(`landing.aboutBento.cards.${key}.label`),
        title: t(`landing.aboutBento.cards.${key}.title`),
        description: t(`landing.aboutBento.cards.${key}.description`),
        ...(key === "discovery"
          ? { images: DISCOVERY_SLIDES }
          : { image: CARD_IMAGES[key] }),
      })),
    [t],
  );

  return (
    <MagicBento
      cards={cards}
      textAutoHide
      enableStars
      enableSpotlight
      enableBorderGlow
      enableTilt={false}
      enableMagnetism={false}
      clickEffect
      spotlightRadius={300}
      particleCount={12}
      glowColor={ISOUNDS_GLOW}
    />
  );
}
