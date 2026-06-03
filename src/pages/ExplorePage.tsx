import { useEffect, useMemo, useState } from "react";
import { ListBullets, SquaresFour } from "@phosphor-icons/react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EpisodeCardSkeleton } from "@/components/shared/EpisodeCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterPanel, type ExploreFilters } from "@/components/shared/FilterPanel";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { useGetCategoriesQuery, useGetTopPodcastsQuery, useSearchPodcastsQuery } from "@/store/api";
import { parseDuration } from "@/lib/format";
import type { Podcast, TopCriteria } from "@/types/podcast";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

function toPositiveInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

function toNonNegativeInt(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function useDebouncedValue<T>(value: T, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [ms, value]);
  return debounced;
}

export default function ExplorePage() {
  const { t } = useTranslation(["search", "common"]);
  const [params, setParams] = useSearchParams();

  const q = params.get("q") ?? "";
  const page = toPositiveInt(params.get("page"), 1);
  const view = (params.get("view") as ViewMode) || "grid";
  const durationMin = toNonNegativeInt(params.get("duration_min"), 0);
  const durationMaxRaw = toNonNegativeInt(params.get("duration_max"), 999);
  const durationMax = Math.max(durationMin, durationMaxRaw);
  const filters: ExploreFilters = {
    category: params.get("category") ?? "",
    sort: (params.get("sort") as TopCriteria) ?? "latest",
    durationMin,
    durationMax,
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
  };

  const debouncedQ = useDebouncedValue(q, 300);
  const isSearching = debouncedQ.trim().length > 0;
  const { data: categories = [] } = useGetCategoriesQuery();

  const searchQuery = useSearchPodcastsQuery(
    { q: debouncedQ, page },
    { skip: !isSearching },
  );
  const topQuery = useGetTopPodcastsQuery(
    {
      criteria: filters.sort,
      categoryId: filters.category ? Number(filters.category) : undefined,
    },
    { skip: isSearching },
  );

  const rawResults = useMemo<Podcast[]>(() => {
    if (isSearching) return searchQuery.data?.podcasts ?? [];
    return topQuery.data ?? [];
  }, [isSearching, searchQuery.data?.podcasts, topQuery.data]);

  const filtered = useMemo(() => {
    const minSecs = filters.durationMin * 60;
    const maxSecs = filters.durationMax * 60;
    const hasExtraFilters =
      filters.durationMin > 0 ||
      filters.durationMax < 999 ||
      Boolean(filters.from) ||
      Boolean(filters.to);

    let list = rawResults;
    if (isSearching && filters.category) {
      list = list.filter(
        (podcast) => String(podcast.category_id) === filters.category,
      );
    }

    if (!hasExtraFilters) return list;

    return list.filter((podcast) => {
      const dur = parseDuration(podcast.duration);
      if (dur < minSecs || dur > maxSecs) return false;
      if (filters.from && podcast.created_at && new Date(podcast.created_at) < new Date(filters.from)) {
        return false;
      }
      if (filters.to && podcast.created_at && new Date(podcast.created_at) > new Date(filters.to)) {
        return false;
      }
      return true;
    });
  }, [filters, isSearching, rawResults]);

  const isLoading = isSearching ? searchQuery.isLoading : topQuery.isLoading;
  const isError = isSearching ? searchQuery.isError : topQuery.isError;
  const refetch = isSearching ? searchQuery.refetch : topQuery.refetch;
  const lastPage = isSearching ? (searchQuery.data?.lastPage ?? 1) : 1;

  const patchParams = (next: Record<string, string | number | undefined | null>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") p.delete(key);
      else p.set(key, String(value));
    });
    if (!("page" in next)) p.set("page", "1");
    setParams(p);
  };

  const setPage = (nextPage: number) => {
    patchParams({ page: nextPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="is-page">
      <section className="is-section">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-4xl font-semibold tracking-tight text-text md:text-5xl">
            {t("search:title")}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="toggle"
              size="icon"
              aria-label={t("search:gridView")}
              aria-pressed={view === "grid"}
              data-state={view === "grid" ? "on" : "off"}
              onClick={() => patchParams({ view: "grid" })}
            >
              <SquaresFour className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="toggle"
              size="icon"
              aria-label={t("search:listView")}
              aria-pressed={view === "list"}
              data-state={view === "list" ? "on" : "off"}
              onClick={() => patchParams({ view: "list" })}
            >
              <ListBullets className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <SearchInput
            value={q}
            onChange={(value) => patchParams({ q: value })}
            onSubmit={(value) => patchParams({ q: value, page: 1 })}
          />
        </div>

        <p className="mb-4 text-body-md text-text-muted">
          {isSearching
            ? t("search:resultsFor", { count: filtered.length, q: debouncedQ })
            : t("search:defaultResults")}
        </p>

        <div className="grid items-start gap-6 lg:grid-cols-[288px_1fr]">
          <div className="lg:sticky lg:top-24">
            <FilterPanel
              categories={categories}
              filters={filters}
              onChange={(next) =>
                patchParams({
                  category: next.category,
                  sort: next.sort,
                  duration_min: next.durationMin,
                  duration_max: next.durationMax,
                  from: next.from,
                  to: next.to,
                })
              }
            />
          </div>
          <div>
            {isLoading && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <EpisodeCardSkeleton key={idx} />
                ))}
              </div>
            )}

            {isError && (
              <EmptyState
                code="500"
                title={t("common:errors.loadFailed")}
                actionLabel={t("common:actions.tryAgain")}
                onAction={() => void refetch()}
              />
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <EmptyState
                code="empty"
                title={t("search:empty")}
                actionLabel={t("common:nav.explore", { defaultValue: "Browse all" })}
                onAction={() => patchParams({ q: "", page: 1, category: "", from: "", to: "" })}
              />
            )}

            {!isLoading && !isError && filtered.length > 0 && (
              <>
                <div
                  className={
                    view === "grid"
                      ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                      : "space-y-3"
                  }
                >
                  {filtered.map((podcast) => (
                    <EpisodeCard
                      key={podcast.id}
                      podcast={podcast}
                      variant={view === "grid" ? "vertical" : "horizontal"}
                      className={view === "grid" ? "w-full max-w-none" : ""}
                    />
                  ))}
                </div>

                {isSearching && lastPage > 1 && (
                  <nav
                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                    aria-label={t("common:aria.pagination")}
                  >
                    {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          "flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-body-md transition-colors",
                          p === page
                            ? "border-primary bg-primary text-white"
                            : "border-border text-text-muted hover:bg-surface-raised",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
