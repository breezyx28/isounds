import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EpisodeCardSkeleton } from "@/components/shared/EpisodeCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { LogoWatermark } from "@/components/shared/LogoWatermark";
import {
  useGetCategoriesQuery,
  useGetCategoryPodcastsQuery,
} from "@/store/api";
import { getCategoryColor } from "@/lib/categoryColors";
import { cn } from "@/lib/utils";

export default function CategoryPage() {
  const { t } = useTranslation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = Number(categoryId);
  const page = Number(searchParams.get("page") ?? "1");

  const { data: categories = [] } = useGetCategoriesQuery();
  const category = categories.find((c) => c.id === id);

  const { data, isLoading, isError, refetch } = useGetCategoryPodcastsQuery(
    { categoryId: id, page },
    { skip: !id || Number.isNaN(id) },
  );

  const color = category
    ? (category.color ?? getCategoryColor(category.id))
    : getCategoryColor(id);

  const podcasts = data?.podcasts ?? [];
  const lastPage = data?.lastPage ?? 1;

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!id || Number.isNaN(id)) {
    return (
      <main className="is-page">
        <section className="is-section flex min-h-[40vh] items-center justify-center">
          <EmptyState code="404" title={t("empty.categories")} actionTo="/categories" actionLabel={t("nav.categories")} />
        </section>
      </main>
    );
  }

  return (
    <main className="is-page">
      <section className="is-section">
      <header
        className="relative mb-10 overflow-hidden rounded-2xl border border-border/70 bg-surface p-6 md:p-8"
        style={{ backgroundColor: `${color}22` }}
      >
        <LogoWatermark />
        <h1 className="relative z-10 text-4xl font-semibold tracking-tight text-text md:text-5xl">
          {category?.name ?? t("category.fallbackTitle", { id })}
        </h1>
        {(data?.totalPodcasts ?? category?.total_podcasts) != null && (
          <p className="relative z-10 mt-2 text-body-md text-text-muted">
            {t("category.episodeCount", {
              count: data?.totalPodcasts ?? category?.total_podcasts,
            })}
          </p>
        )}
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EpisodeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          code="500"
          title={t("errors.loadFailed")}
          actionLabel={t("actions.tryAgain")}
          onAction={() => refetch()}
        />
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {podcasts.map((podcast) => (
              <EpisodeCard
                key={podcast.id}
                podcast={podcast}
                variant="grid"
                className="w-full max-w-none"
              />
            ))}
          </div>

          {podcasts.length === 0 && (
            <EmptyState code="empty" title={t("empty.episodes")} actionTo="/explore" actionLabel={t("nav.explore")} />
          )}

          {lastPage > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label={t("aria.pagination")}
            >
              {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  to={`?page=${p}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-body-md transition-colors",
                    p === page
                      ? "border-primary bg-primary text-white"
                      : "border-border text-text-muted hover:bg-surface-raised",
                  )}
                >
                  {p}
                </Link>
              ))}
            </nav>
          )}
        </>
      )}
      </section>
    </main>
  );
}
