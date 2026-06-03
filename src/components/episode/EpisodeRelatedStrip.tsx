import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Podcast } from "@/types/podcast";

interface EpisodeRelatedStripProps {
  episodes: Podcast[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  categoryId?: number;
}

export function EpisodeRelatedStrip({
  episodes,
  isLoading,
  isError,
  onRetry,
  categoryId,
}: EpisodeRelatedStripProps) {
  const { t } = useTranslation(["common", "episodes", "player"]);
  const viewAllTo = categoryId ? `/categories/${categoryId}` : "/explore";

  return (
    <section className="space-y-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-display-md font-semibold tracking-tight text-text">
          {t("episodes:detail.relatedMore")}
        </h2>
        <Button variant="ghost" size="sm" asChild className="text-primary">
          <Link to={viewAllTo}>{t("common:actions.viewAll")}</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-[28px]" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          code="500"
          title={t("common:errors.loadFailed")}
          actionLabel={t("common:actions.tryAgain")}
          onAction={onRetry}
        />
      )}

      {!isLoading && !isError && episodes.length === 0 && (
        <EmptyState code="empty" title={t("common:empty.episodes")} />
      )}

      {!isLoading && !isError && episodes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {episodes.map((podcast) => (
            <EpisodeCard
              key={podcast.id}
              podcast={podcast}
              variant="grid"
              disableHover
            />
          ))}
        </div>
      )}
    </section>
  );
}
