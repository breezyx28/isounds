import { CalendarBlank, Clock, Eye } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { EpisodeTypeBadge } from "@/components/episode/EpisodeTypeBadge";
import { formatCount, formatDate, formatDuration } from "@/lib/format";
import type { Podcast } from "@/types/podcast";

const WAVE_HEIGHTS = [8, 14, 20, 28, 22, 16, 26, 10, 20, 14, 24, 8, 18, 28, 20];

export interface EpisodeDetailHeroProps {
  podcast: Podcast;
  language: string;
}

export function EpisodeDetailHero({ podcast, language }: EpisodeDetailHeroProps) {
  const { i18n } = useTranslation();
  const imageUrl = podcast.image ?? "/logo.png";

  return (
    <header className="episode-hero">
      <div className="episode-hero__blob episode-hero__blob--start" aria-hidden />
      <div className="episode-hero__blob episode-hero__blob--end" aria-hidden />

      <div className="episode-hero__inner">
        <img
          src={imageUrl}
          alt={podcast.name}
          width={160}
          height={160}
          loading="eager"
          fetchPriority="high"
          className="episode-hero__poster"
        />

        <div className="min-w-0 flex-1">
          <EpisodeTypeBadge isVideo={Boolean(podcast.video)} />
          <h1 className="mt-2 text-display-md font-semibold leading-snug tracking-tight text-text text-balance md:text-display-lg">
            {podcast.name}
          </h1>

          {podcast.category?.name && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="episode-hero__chip episode-hero__chip--category">
                {podcast.category.name}
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-4 text-label text-text-muted">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              {formatCount(podcast.views ?? 0, language)}
            </span>
            {podcast.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {formatDuration(podcast.duration)}
              </span>
            )}
            {podcast.created_at && (
              <span className="flex items-center gap-1">
                <CalendarBlank className="h-3.5 w-3.5" aria-hidden />
                {formatDate(podcast.created_at, i18n.language)}
              </span>
            )}
            <span className="flex items-center gap-0.5" aria-hidden>
              {WAVE_HEIGHTS.map((height, index) => (
                <span
                  key={index}
                  className="w-0.5 rounded-full bg-primary/50"
                  style={{ height }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
