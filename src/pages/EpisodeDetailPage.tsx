import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarBlank, Clock, Eye, Heart } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EpisodeMediaStage } from "@/components/episode/EpisodeMediaStage";
import { EpisodeRelatedStrip } from "@/components/episode/EpisodeRelatedStrip";
import { RelatedEpisodesSidebar } from "@/components/episode/RelatedEpisodesSidebar";
import { ExpandableDescription } from "@/components/shared/ExpandableDescription";
import { EmptyState } from "@/components/shared/EmptyState";
import { StarRating } from "@/components/shared/StarRating";
import { ComplaintModal } from "@/components/shared/ComplaintModal";
import {
  useCheckLikeQuery,
  useGetPodcastDetailQuery,
  useGetTopPodcastsQuery,
  useLikePodcastMutation,
  useUnlikePodcastMutation,
} from "@/store/api";
import {
  useGetListeningPositionQuery,
  useSaveListeningPositionMutation,
} from "@/store/localApi";
import { usePlayer } from "@/features/player/usePlayer";
import { useAppSelector } from "@/store/hooks";
import { formatCount, formatDate, formatDuration } from "@/lib/format";
import type { Podcast } from "@/types/podcast";

function shuffleEpisodes<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function EpisodeDetailPage() {
  const { t, i18n } = useTranslation(["common", "player", "episodes"]);
  const { id } = useParams<{ id: string }>();
  const podcastId = Number(id);
  const navigate = useNavigate();
  const language = useAppSelector((s) => s.ui.language);
  const auth = useAppSelector((state) => state.auth);
  const isSubscribed = auth.status === "subscribed" && Boolean(auth.user?.token);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [shuffledRelated, setShuffledRelated] = useState<Podcast[]>([]);
  const { seek, play } = usePlayer();
  const lastVideoSaveRef = useRef(0);

  const {
    data: podcast,
    isLoading,
    isError,
    refetch,
  } = useGetPodcastDetailQuery(podcastId, {
    skip: !podcastId || Number.isNaN(podcastId),
  });
  const { data: likedState } = useCheckLikeQuery(podcastId, {
    skip: !isSubscribed || !podcastId || Number.isNaN(podcastId),
  });
  const { data: listeningPosition } = useGetListeningPositionQuery(podcastId, {
    skip: !podcastId || Number.isNaN(podcastId),
  });
  const [likePodcast] = useLikePodcastMutation();
  const [unlikePodcast] = useUnlikePodcastMutation();
  const [saveListeningPosition] = useSaveListeningPositionMutation();

  const {
    data: relatedData = [],
    isLoading: relatedLoading,
    isError: relatedError,
    refetch: refetchRelated,
  } = useGetTopPodcastsQuery(
    { criteria: "latest", categoryId: podcast?.category_id },
    { skip: !podcast },
  );

  useEffect(() => {
    if (!podcast) return;
    setLiked(Boolean(podcast.liked ?? likedState));
    setLikesCount(podcast.likes ?? 0);
  }, [likedState, podcast]);

  const filteredRelated = useMemo(
    () => relatedData.filter((item) => item.id !== podcastId),
    [relatedData, podcastId],
  );

  const stableRelated = useMemo(
    () => filteredRelated.slice(0, 5),
    [filteredRelated],
  );

  useEffect(() => {
    setShuffledRelated(
      filteredRelated.length
        ? shuffleEpisodes(filteredRelated).slice(0, 6)
        : [],
    );
  }, [podcastId, filteredRelated]);

  const currentUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }, []);

  const canResume = (listeningPosition?.position_seconds ?? 0) > 10;
  const resumeSeconds = listeningPosition?.position_seconds ?? 0;

  const handleLike = useCallback(async () => {
    if (!podcast) return;
    if (!isSubscribed) {
      navigate("/subscribe?reason=like_requires_subscription");
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikesCount((count) => Math.max(0, count + (next ? 1 : -1)));
    try {
      if (next) await likePodcast(podcast.id).unwrap();
      else await unlikePodcast(podcast.id).unwrap();
    } catch {
      setLiked(!next);
      setLikesCount((count) => Math.max(0, count + (next ? -1 : 1)));
    }
  }, [isSubscribed, liked, likePodcast, navigate, podcast, unlikePodcast]);

  const handleResume = useCallback(() => {
    if (!podcast) return;
    if (podcast.video) {
      const el = document.getElementById("episode-video");
      if (el instanceof HTMLVideoElement) {
        el.currentTime = resumeSeconds;
        void el.play().catch(() => undefined);
      }
      return;
    }
    seek(resumeSeconds);
    play();
  }, [play, podcast, resumeSeconds, seek]);

  const handleVideoTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!podcast) return;
      const now = Date.now();
      if (now - lastVideoSaveRef.current < 10_000 || duration <= 0) return;
      lastVideoSaveRef.current = now;
      void saveListeningPosition({
        podcast_id: podcast.id,
        position_seconds: currentTime,
        duration_seconds: duration,
      });
    },
    [podcast, saveListeningPosition],
  );

  if (!podcastId || Number.isNaN(podcastId)) {
    return (
      <main className="is-page">
        <section className="is-section flex min-h-[40vh] items-center justify-center">
          <EmptyState
            code="404"
            title={t("common:notFound.title")}
            description={t("common:notFound.description")}
            actionLabel={t("common:actions.backHome")}
            actionTo="/"
          />
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="is-page">
        <section className="is-section max-w-7xl mx-auto w-full px-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex min-w-0 flex-1 flex-col gap-6 lg:flex-[3]">
              <Skeleton className="min-h-[22rem] w-full" />
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="flex flex-col gap-4 lg:flex-[1]">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-72 w-full rounded-[28px]" />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (isError || !podcast) {
    return (
      <main className="is-page">
        <section className="is-section flex min-h-[40vh] items-center justify-center">
          <EmptyState
            code="500"
            title={t("common:errors.loadFailed")}
            actionLabel={t("common:actions.tryAgain")}
            onAction={() => refetch()}
          />
        </section>
      </main>
    );
  }

  const mediaStage = (
    <EpisodeMediaStage
      podcast={podcast}
      isSubscribed={isSubscribed}
      shareUrl={currentUrl}
      liked={liked}
      onLike={() => void handleLike()}
      canResume={canResume}
      resumeSeconds={resumeSeconds}
      onResume={handleResume}
      onVideoTimeUpdate={handleVideoTimeUpdate}
    />
  );

  const relatedSidebar = (
    <RelatedEpisodesSidebar
      podcastId={podcast.id}
      categoryId={podcast.category_id}
      compact
      episodes={stableRelated}
      isLoading={relatedLoading}
      isError={relatedError}
      onRetry={() => refetchRelated()}
    />
  );

  const episodeBody = (
    <div className="space-y-0">
      <div className="py-6">
        <h1 className="text-display-md font-semibold leading-snug tracking-tight text-text text-balance md:text-display-lg">
          {podcast.name}
        </h1>
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
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-primary" weight="fill" aria-hidden />
            {t("player:likesCount", {
              count: formatCount(likesCount, language),
            })}
          </span>
        </div>
      </div>

      <Separator />

      <ExpandableDescription description={podcast.description} variant="flat" />

      <Separator />

      <StarRating podcastId={podcast.id} variant="flat" />

      <Separator />

      <div className="py-4">
        <ComplaintModal podcastId={podcast.id} />
      </div>

      <Separator />

      <EpisodeRelatedStrip
        episodes={shuffledRelated}
        isLoading={relatedLoading}
        isError={relatedError}
        onRetry={() => refetchRelated()}
        categoryId={podcast.category_id}
      />
    </div>
  );

  return (
    <main className="is-page">
      <section className="is-section mx-auto w-full max-w-7xl px-4">
        {/* Mobile: poster → sidebar → details */}
        <div className="flex flex-col gap-6 lg:hidden">
          {mediaStage}
          {relatedSidebar}
          {episodeBody}
        </div>

        {/* Desktop: 75% column (poster + details) | 25% sidebar */}
        <div className="hidden gap-6 lg:flex lg:items-start">
          <div className="flex min-w-0 flex-[3] flex-col">
            {mediaStage}
            {episodeBody}
          </div>
          <div className="min-w-0 flex-[1]">{relatedSidebar}</div>
        </div>
      </section>
    </main>
  );
}
