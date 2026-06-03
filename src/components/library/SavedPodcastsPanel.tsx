import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EpisodeCardSkeleton } from "@/components/shared/EpisodeCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { useGetPodcastDetailQuery } from "@/store/api";
import { useGetBookmarksQuery } from "@/store/localApi";
import { cn } from "@/lib/utils";

function SavedPodcastItem({ podcastId }: { podcastId: number }) {
  const { data, isLoading, isError } = useGetPodcastDetailQuery(podcastId);

  if (isLoading) return <EpisodeCardSkeleton />;
  if (isError || !data) return null;

  return <EpisodeCard podcast={data} className="w-full max-w-none" />;
}

export function SavedPodcastsPanel({ className }: { className?: string }) {
  const { t } = useTranslation(["library", "common"]);
  const { data: bookmarks = [], isLoading, isError, refetch } = useGetBookmarksQuery();

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4", className)}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <EpisodeCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        code="500"
        title={t("common:errors.loadFailed")}
        description={t("library:saved.errorHint", {
          defaultValue: "We could not load your saved podcasts.",
        })}
        actionLabel={t("common:actions.tryAgain")}
        onAction={() => void refetch()}
      />
    );
  }

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        code="empty"
        title={t("library:empty.saved", { defaultValue: "No saved podcasts yet" })}
        description={t("library:empty.savedHint", {
          defaultValue: "Bookmark episodes while browsing to find them here.",
        })}
        actionLabel={t("common:nav.explore", { defaultValue: "Explore" })}
        actionTo="/explore"
      />
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4", className)}>
      {bookmarks.map((item) => (
        <SavedPodcastItem key={item.podcast_id} podcastId={item.podcast_id} />
      ))}
    </div>
  );
}

export function SavedPodcastsPage() {
  const { t } = useTranslation("library");

  return (
    <main className="is-page">
      <section className="is-section">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {t("tabs.saved", { defaultValue: "Saved" })}
          </h1>
          <Link
            to="/library"
            className="min-h-11 rounded-md border border-border px-4 py-2.5 text-body-md text-text-muted transition-colors hover:bg-surface-raised"
          >
            {t("backToLibrary", { defaultValue: "Back to library" })}
          </Link>
        </div>
        <SavedPodcastsPanel />
      </section>
    </main>
  );
}
