import { useTranslation } from "react-i18next";
import { ArrowUpRight, ChartLineUp, Headphones, Timer } from "@phosphor-icons/react";
import { FrostGlassChip } from "@/components/ui/frost-glass-chip";
import { cn } from "@/lib/utils";

type PosterVariant = "stat" | "tip" | "word";

type LandingCategoryPosterCardProps = {
  posterKey: string;
  className?: string;
  /** Dynamic platform total for interleave stat cards */
  platformPodcastTotal?: number;
};

const POSTER_VARIANTS: Record<string, PosterVariant> = {
  "interleave-0": "stat",
  "interleave-1": "tip",
  "fill-0": "stat",
  "fill-1": "tip",
  "fill-2": "word",
};

function getPosterVariant(posterKey: string): PosterVariant {
  return POSTER_VARIANTS[posterKey] ?? "stat";
}

const VARIANT_STYLES: Record<PosterVariant, string> = {
  stat: "bg-[#ebe4f7] text-[#4a2d6e]",
  tip: "bg-[#1c1830] text-white",
  word: "bg-[#9f67db] text-white",
};

export function LandingCategoryPosterCard({
  posterKey,
  className,
  platformPodcastTotal,
}: LandingCategoryPosterCardProps) {
  const { t } = useTranslation();
  const variant = getPosterVariant(posterKey);
  const baseKey = `landing.categories.posters.${posterKey}`;

  const chip = t(`${baseKey}.chip`, { defaultValue: "" });
  const value = t(`${baseKey}.value`, {
    count: platformPodcastTotal ?? 0,
    defaultValue: "",
  });
  const label = t(`${baseKey}.label`, { defaultValue: "" });
  const headline = t(`${baseKey}.headline`, { defaultValue: "" });
  const body = t(`${baseKey}.body`, { defaultValue: "" });
  const word = t(`${baseKey}.word`, { defaultValue: "" });

  return (
    <article
      className={cn(
        "relative flex aspect-square h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl p-2.5 sm:p-3",
        VARIANT_STYLES[variant],
        className,
      )}
      aria-label={headline || label || word || value}
    >
      {variant === "stat" && (
        <>
          {chip ? (
            <FrostGlassChip className="gap-x-1.5 px-2.5 py-1.5 text-[9px] leading-none text-black/75 sm:text-[10px]">
              <ChartLineUp className="h-3.5 w-3.5 shrink-0" weight="bold" />
              {chip}
            </FrostGlassChip>
          ) : null}
          <div className="mt-auto flex flex-col">
            <p className="text-[clamp(1.5rem,5vw,2.25rem)] font-black leading-none tracking-tight">
              {value}
            </p>
            {label ? (
              <p className="mt-1 max-w-[14ch] text-[10px] font-semibold leading-snug opacity-80 sm:text-xs">
                {label}
              </p>
            ) : null}
          </div>
          <Timer
            className="absolute end-2.5 top-2.5 opacity-30 sm:end-3 sm:top-3"
            size={32}
            weight="duotone"
          />
        </>
      )}

      {variant === "tip" && (
        <>
          {chip ? (
            <FrostGlassChip className="w-fit gap-x-1.5 px-2.5 py-1.5 text-[9px] leading-none text-black/75 sm:text-[10px]">
              {chip}
            </FrostGlassChip>
          ) : null}
          <div className="mt-auto">
            <p className="text-sm font-bold leading-tight sm:text-base">{headline}</p>
            {body ? (
              <p className="mt-1 text-[10px] leading-relaxed text-white/75 sm:text-xs">{body}</p>
            ) : null}
          </div>
          <span
            className="absolute end-2.5 bottom-2.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#b8f55a] text-[#1c1830] sm:end-3 sm:bottom-3 sm:h-8 sm:w-8"
            aria-hidden
          >
            <ArrowUpRight className="h-4 w-4" weight="bold" />
          </span>
        </>
      )}

      {variant === "word" && (
        <>
          <Headphones
            className="absolute end-2.5 top-2.5 opacity-25 sm:end-3 sm:top-3"
            size={36}
            weight="duotone"
          />
          <p className="mt-auto text-[clamp(1.25rem,6vw,2rem)] font-black uppercase leading-[0.9] tracking-tight">
            {word}
          </p>
          {label ? (
            <p className="mt-1 text-[10px] font-medium text-white/85 sm:text-xs">{label}</p>
          ) : null}
        </>
      )}
    </article>
  );
}
