import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetTopPodcastsQuery } from "@/store/api";
import type { TopCriteria } from "@/types/podcast";
import { cn } from "@/lib/utils";

const CRITERIA: TopCriteria[] = ["latest", "liked", "viewed"];

interface RelatedEpisodesGridProps {
  podcastId: number;
  categoryId?: number;
}

export function RelatedEpisodesGrid({
  podcastId,
  categoryId,
}: RelatedEpisodesGridProps) {
  const { t } = useTranslation(["common", "player"]);
  const [criteria, setCriteria] = useState<TopCriteria>("latest");
  const { data = [], isLoading, isError, refetch } = useGetTopPodcastsQuery({
    criteria,
    categoryId,
  });

  const related = data.filter((item) => item.id !== podcastId).slice(0, 9);
  const viewAllTo = categoryId ? `/categories/${categoryId}` : "/explore";

  const chipLabel: Record<TopCriteria, string> = {
    latest: t("common:sections.latest"),
    liked: t("common:sections.liked"),
    viewed: t("common:sections.viewed"),
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-display-md font-semibold tracking-tight text-text">
          {t("player:relatedEpisodes")}
        </h2>
        <Button variant="ghost" size="sm" asChild className="text-primary">
          <Link to={viewAllTo}>{t("common:actions.viewAll")}</Link>
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CRITERIA.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setCriteria(value)}
            className={cn(
              "shrink-0 min-h-11 rounded-full border px-4 py-2.5 text-label font-medium transition-colors",
              criteria === value
                ? "border-primary bg-primary text-white"
                : "border-border bg-surface-raised text-text-muted hover:bg-surface",
            )}
          >
            {chipLabel[value]}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-80 w-full rounded-[28px]" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          code="500"
          title={t("common:errors.loadFailed")}
          actionLabel={t("common:actions.tryAgain")}
          onAction={() => refetch()}
        />
      )}

      {!isLoading && !isError && related.length === 0 && (
        <EmptyState code="empty" title={t("common:empty.episodes")} />
      )}

      {!isLoading && !isError && related.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((podcast) => (
            <EpisodeCard key={podcast.id} podcast={podcast} variant="grid" />
          ))}
        </div>
      )}
    </section>
  );
}
