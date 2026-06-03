import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EpisodeCardSkeleton } from "@/components/shared/EpisodeCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { SavedPodcastsPanel } from "@/components/library/SavedPodcastsPanel";
import { Button } from "@/components/ui/button";
import { useGetLikedPodcastsQuery } from "@/store/api";
import {
  useClearSearchHistoryMutation,
  useDeleteSearchHistoryMutation,
  useGetListeningHistoryQuery,
  useGetSearchHistoryQuery,
} from "@/store/localApi";
import { cn } from "@/lib/utils";

type Tab = "liked" | "saved" | "listening" | "history";

export default function LibraryPage() {
  const { t } = useTranslation(["library", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: Tab =
    tabParam === "liked" ||
    tabParam === "saved" ||
    tabParam === "listening" ||
    tabParam === "history"
      ? tabParam
      : "liked";

  const selectTab = (next: Tab) => {
    const updated = new URLSearchParams(searchParams);
    updated.set("tab", next);
    setSearchParams(updated, { replace: true });
  };

  const liked = useGetLikedPodcastsQuery(1, { skip: tab !== "liked" });
  const listening = useGetListeningHistoryQuery(undefined, { skip: tab !== "listening" });
  const history = useGetSearchHistoryQuery(undefined, { skip: tab !== "history" });
  const [deleteHistory] = useDeleteSearchHistoryMutation();
  const [clearHistory] = useClearSearchHistoryMutation();

  const tabs: Tab[] = ["liked", "saved", "listening", "history"];

  return (
    <main className="is-page">
      <section className="is-section">
        <h1 className="mb-6 text-4xl font-semibold tracking-tight text-text md:text-5xl">
          {t("library:title")}
        </h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                "min-h-11 rounded-md border px-4 py-2.5 text-body-md transition-colors",
                tab === item
                  ? "border-primary bg-primary text-white"
                  : "border-border text-text-muted hover:bg-surface-raised",
              )}
              onClick={() => selectTab(item)}
            >
              {t(`library:tabs.${item}`, {
                defaultValue: item === "saved" ? "Saved" : undefined,
              })}
            </button>
          ))}
        </div>

        {tab === "liked" && (
          <>
            {liked.isLoading && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <EpisodeCardSkeleton key={idx} />
                ))}
              </div>
            )}
            {liked.isError && (
              <EmptyState
                code="500"
                title={t("common:errors.loadFailed")}
                actionLabel={t("common:actions.tryAgain")}
                onAction={() => void liked.refetch()}
              />
            )}
            {!liked.isLoading && !liked.isError && (liked.data?.podcasts?.length ?? 0) === 0 && (
              <EmptyState
                code="empty"
                title={t("library:empty.liked")}
                actionLabel={t("common:nav.explore", { defaultValue: "Explore" })}
                actionTo="/explore"
              />
            )}
            {!liked.isLoading && !liked.isError && (liked.data?.podcasts?.length ?? 0) > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {liked.data!.podcasts.map((podcast) => (
                  <EpisodeCard key={podcast.id} podcast={podcast} className="w-full max-w-none" />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "saved" && <SavedPodcastsPanel />}

        {tab === "listening" && (
          <>
            {listening.isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <EpisodeCardSkeleton key={idx} variant="horizontal" />
                ))}
              </div>
            )}
            {!listening.isLoading && (listening.data?.length ?? 0) === 0 && (
              <EmptyState code="empty" title={t("library:empty.listening")} actionTo="/explore" actionLabel={t("common:nav.explore", { defaultValue: "Explore" })} />
            )}
            {!listening.isLoading && (listening.data?.length ?? 0) > 0 && (
              <div className="space-y-3">
                {listening.data!.map((item) => (
                  <Link
                    key={item.podcast_id}
                    to={`/podcasts/${item.podcast_id}`}
                    className="block min-h-11 rounded-xl border border-border/70 bg-surface p-4 transition-colors hover:bg-surface-raised"
                  >
                    <p className="text-body-md text-text">
                      {t("library:listeningEpisode", { id: item.podcast_id })}
                    </p>
                    <p className="text-label text-text-muted">
                      {t("library:progress", {
                        pos: Math.floor(item.position_seconds),
                        dur: Math.floor(item.duration_seconds),
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "history" && (
          <>
            {history.isLoading && (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-11 animate-pulse rounded-md bg-surface-raised" />
                ))}
              </div>
            )}
            {!history.isLoading && (history.data?.length ?? 0) === 0 && (
              <EmptyState code="empty" title={t("library:empty.history")} actionTo="/explore" actionLabel={t("common:nav.explore", { defaultValue: "Explore" })} />
            )}
            {!history.isLoading && (history.data?.length ?? 0) > 0 && (
              <div className="space-y-2">
                <div className="mb-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => void clearHistory()}>
                    {t("library:clearHistory")}
                  </Button>
                </div>
                {history.data!.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border/70 bg-surface px-4 py-3"
                  >
                    <Link to={`/explore?q=${encodeURIComponent(item.query)}`} className="text-body-md text-text">
                      {item.query}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void deleteHistory(item.id)}
                    >
                      {t("library:delete")}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
