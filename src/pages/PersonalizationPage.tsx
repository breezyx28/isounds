import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Bell, EyeSlash, PushPin, Sparkle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EpisodeCard } from "@/components/shared/EpisodeCard";
import { EpisodeCardSkeleton } from "@/components/shared/EpisodeCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePushNotifications } from "@/features/push/usePushNotifications";
import { getCategoryColor } from "@/lib/categoryColors";
import { formatRelativeDate } from "@/lib/format";
import { useGetCategoriesQuery, useGetTopPodcastsQuery } from "@/store/api";
import {
  useGetPersonalizationProfileQuery,
  useRecomputePersonalizationMutation,
  useResetPersonalizationSettingsMutation,
  useUpdateCategorySettingsMutation,
} from "@/store/localApi";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

function ForYouFeed({ categoryIds }: { categoryIds: number[] }) {
  const topIds = categoryIds.slice(0, 3);
  const q1 = useGetTopPodcastsQuery(
    { criteria: "latest", categoryId: topIds[0] },
    { skip: !topIds[0] },
  );
  const q2 = useGetTopPodcastsQuery(
    { criteria: "latest", categoryId: topIds[1] },
    { skip: !topIds[1] },
  );
  const q3 = useGetTopPodcastsQuery(
    { criteria: "latest", categoryId: topIds[2] },
    { skip: !topIds[2] },
  );

  const episodes = useMemo(() => {
    const merged = [...(q1.data ?? []), ...(q2.data ?? []), ...(q3.data ?? [])];
    const seen = new Set<number>();
    return merged.filter((podcast) => {
      if (seen.has(podcast.id)) return false;
      seen.add(podcast.id);
      return true;
    }).slice(0, 8);
  }, [q1.data, q2.data, q3.data]);

  const loading = q1.isLoading || q2.isLoading || q3.isLoading;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <EpisodeCardSkeleton key={i} variant="horizontal" mediaClassName="h-[140px]" />
        ))}
      </div>
    );
  }

  if (episodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {episodes.map((podcast) => (
        <EpisodeCard
          key={podcast.id}
          podcast={podcast}
          variant="horizontal"
          mediaClassName="h-[140px]"
          className="w-full max-w-none"
        />
      ))}
    </div>
  );
}

export default function PersonalizationPage() {
  const { t } = useTranslation(["personalization", "common"]);
  const language = useAppSelector((s) => s.ui.language);
  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: profile, isLoading, isError, refetch } = useGetPersonalizationProfileQuery();
  const [recompute, { isLoading: recomputing }] = useRecomputePersonalizationMutation();
  const [updateSettings] = useUpdateCategorySettingsMutation();
  const [resetSettings] = useResetPersonalizationSettingsMutation();
  const push = usePushNotifications();

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const settingsMap = useMemo(
    () => new Map((profile?.settings ?? []).map((s) => [s.category_id, s])),
    [profile?.settings],
  );

  const visibleAffinities = useMemo(
    () =>
      (profile?.affinities ?? []).filter((a) => !settingsMap.get(a.category_id)?.hidden),
    [profile?.affinities, settingsMap],
  );

  const topCategoryIds = visibleAffinities.map((a) => a.category_id);

  const handleRefresh = async () => {
    try {
      await recompute().unwrap();
      await refetch();
    } catch {
      toast.error(t("personalization:rateLimited"));
    }
  };

  const handleReset = async () => {
    await resetSettings().unwrap();
    toast.success(t("personalization:privacy.resetConfirm"));
  };

  const lastUpdatedLabel =
    profile?.last_updated && profile.last_updated > 0
      ? formatRelativeDate(new Date(profile.last_updated * 1000).toISOString(), language)
      : null;

  return (
    <main className="is-page">
      <section className="is-section mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-primary">
              <Sparkle className="h-5 w-5" weight="fill" aria-hidden />
              <span className="text-label font-semibold uppercase tracking-wide">
                {t("personalization:title")}
              </span>
            </div>
            <p className="max-w-xl text-body-md text-text-muted">{t("personalization:subtitle")}</p>
            {lastUpdatedLabel && (
              <p className="mt-2 text-label text-text-muted">
                {t("personalization:lastUpdated", { date: lastUpdatedLabel })}
              </p>
            )}
            {profile?.event_count != null && (
              <p className="mt-1 text-label text-text-muted">
                {t("personalization:eventCount", { count: profile.event_count })}
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleRefresh()}
            disabled={recomputing}
            className="shrink-0"
          >
            {recomputing ? t("personalization:refreshing") : t("personalization:refresh")}
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
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

        {!isLoading && !isError && visibleAffinities.length === 0 && (
          <EmptyState
            code="empty"
            title={t("personalization:coldStart.title")}
            description={t("personalization:coldStart.body")}
            actionLabel={t("personalization:coldStart.browse")}
            actionTo="/browse"
          />
        )}

        {!isLoading && !isError && visibleAffinities.length > 0 && (
          <div className="space-y-10">
            <section>
              <h2 className="mb-4 text-body-lg font-semibold text-text">
                {t("personalization:tasteSection")}
              </h2>
              <ul className="space-y-3">
                {visibleAffinities.slice(0, 5).map((affinity) => {
                  const category = categoryMap.get(affinity.category_id);
                  const color = category?.color ?? getCategoryColor(affinity.category_id);
                  const settings = settingsMap.get(affinity.category_id);
                  return (
                    <li
                      key={affinity.category_id}
                      className="rounded-xl border border-border/70 bg-surface p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="font-medium text-text">
                          {category?.name ?? `#${affinity.category_id}`}
                        </span>
                        <span className="text-label tabular-nums text-text-muted">
                          {Math.round(affinity.score)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${Math.min(100, affinity.score)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                      {settings?.pinned && (
                        <span className="mt-2 inline-block text-label text-primary">
                          {t("personalization:pinnedLabel")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h2 className="mb-4 text-body-lg font-semibold text-text">
                {t("personalization:controlsSection")}
              </h2>
              <ul className="space-y-2">
                {categories.map((category) => {
                  const settings = settingsMap.get(category.id);
                  const hidden = settings?.hidden ?? false;
                  const pinned = settings?.pinned ?? false;
                  const pushEnabled = settings?.push_enabled ?? true;
                  return (
                    <li
                      key={category.id}
                      className={cn(
                        "flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-surface p-3",
                        hidden && "opacity-60",
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-text">
                        {category.name}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={pinned ? "primary" : "toggle"}
                        onClick={() =>
                          void updateSettings({
                            category_id: category.id,
                            pinned: !pinned,
                          })
                        }
                        aria-pressed={pinned}
                      >
                        <PushPin className="h-4 w-4" weight={pinned ? "fill" : "regular"} />
                        {pinned ? t("personalization:unpin") : t("personalization:pin")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={hidden ? "primary" : "toggle"}
                        onClick={() =>
                          void updateSettings({
                            category_id: category.id,
                            hidden: !hidden,
                          })
                        }
                        aria-pressed={hidden}
                      >
                        <EyeSlash className="h-4 w-4" />
                        {hidden ? t("personalization:show") : t("personalization:hide")}
                      </Button>
                      {push.pushSubscribed && (
                        <Button
                          type="button"
                          size="sm"
                          variant={pushEnabled ? "primary" : "toggle"}
                          onClick={() =>
                            void updateSettings({
                              category_id: category.id,
                              push_enabled: !pushEnabled,
                            })
                          }
                          aria-pressed={pushEnabled}
                        >
                          <Bell className="h-4 w-4" weight={pushEnabled ? "fill" : "regular"} />
                          {pushEnabled
                            ? t("personalization:pushOn")
                            : t("personalization:pushOff")}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="rounded-2xl border border-border/70 bg-surface p-5 md:p-6">
              <h2 className="mb-2 text-body-lg font-semibold text-text">
                {t("personalization:notifications.title")}
              </h2>
              <p className="mb-4 text-body-md text-text-muted">
                {t("personalization:notifications.body")}
              </p>
              {typeof navigator !== "undefined" &&
                /iPhone|iPad|iPod/.test(navigator.userAgent) && (
                <p className="mb-4 text-label text-text-muted">
                  {t("personalization:notifications.iosHint")}
                </p>
              )}
              {!push.supported ? (
                <p className="text-body-md text-text-muted">{t("personalization:push.unsupported")}</p>
              ) : push.pushSubscribed ? (
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-md border border-success/40 bg-success/10 px-3 py-2 text-body-md text-success">
                    {t("personalization:notifications.enabled")}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={push.busy}
                    onClick={() => void push.disablePush()}
                  >
                    {t("personalization:notifications.disable")}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  disabled={push.busy || !push.pushConfigured}
                  onClick={() => void push.enablePush()}
                >
                  {t("personalization:notifications.enable")}
                </Button>
              )}
            </section>

            {topCategoryIds.length > 0 && (
              <section>
                <h2 className="mb-4 text-body-lg font-semibold text-text">
                  {t("personalization:forYouSection")}
                </h2>
                <ForYouFeed categoryIds={topCategoryIds} />
              </section>
            )}

            <section className="rounded-2xl border border-dashed border-border/70 p-5">
              <h2 className="mb-2 text-body-md font-semibold text-text">
                {t("personalization:privacy.title")}
              </h2>
              <p className="mb-4 text-body-md text-text-muted">
                {t("personalization:privacy.body")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="ghost" onClick={() => void handleReset()}>
                  {t("personalization:privacy.resetOverrides")}
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/library">{t("common:nav.library", { defaultValue: "Library" })}</Link>
                </Button>
              </div>
            </section>
          </div>
        )}

        {!isLoading && !isError && visibleAffinities.length === 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link to="/browse">{t("personalization:coldStart.browse")}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/categories">{t("personalization:coldStart.explore")}</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
