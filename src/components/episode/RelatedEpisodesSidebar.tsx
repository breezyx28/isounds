import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetTopPodcastsQuery } from "@/store/api";
import type { Podcast } from "@/types/podcast";

interface RelatedEpisodesSidebarProps {
  podcastId: number;
  categoryId?: number;
  compact?: boolean;
  episodes?: Podcast[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function RelatedEpisodesSidebar({
  podcastId,
  categoryId,
  compact = false,
  episodes: episodesProp,
  isLoading: isLoadingProp,
  isError: isErrorProp,
  onRetry,
}: RelatedEpisodesSidebarProps) {
  const { t } = useTranslation(["common", "episodes", "player"]);
  const query = useGetTopPodcastsQuery(
    { criteria: "latest", categoryId },
    { skip: Boolean(episodesProp) },
  );

  const isLoading = episodesProp ? (isLoadingProp ?? false) : query.isLoading;
  const isError = episodesProp ? (isErrorProp ?? false) : query.isError;
  const refetch = onRetry ?? query.refetch;
  const source = episodesProp ?? query.data ?? [];
  const related = source.filter((item) => item.id !== podcastId).slice(0, 5);
  const viewAllTo = categoryId ? `/categories/${categoryId}` : "/explore";

  return (
    <aside
      className={
        compact
          ? "w-full shrink-0 space-y-3 lg:sticky lg:top-24 lg:max-w-none lg:self-start"
          : "md:sticky md:top-24 md:self-start"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-body-lg font-semibold text-text">
          {t("episodes:detail.relatedSidebar")}
        </h2>
        <Button variant="ghost" size="sm" asChild className="text-primary">
          <Link to={viewAllTo}>{t("common:actions.viewAll")}</Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className={compact ? "h-20 w-full rounded-xl" : "h-24 w-full rounded-xl"}
            />
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
        <div className="flex flex-col items-stretch gap-4">
          {related.map((podcast) => (
            <EpisodeCard
              key={podcast.id}
              podcast={podcast}
              variant={compact ? "sidebar" : "vertical"}
              disableHover={compact}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
