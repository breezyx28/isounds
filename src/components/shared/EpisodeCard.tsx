import { memo, useCallback, useEffect, useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BookmarkSimple, Heart } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  CutoutCard,
  CutoutCardContent,
  CutoutCardFooter,
  CutoutCardImage,
  CutoutCardInsetLabel,
  CutoutCardMedia,
  CutoutCardOverlay,
  CutoutCardPin,
  CutoutCorner,
  cutoutCardSurfaceClassName,
  useCutoutContentStaggerVariants,
} from "@/components/ui/cutout-card";
import { ShareModal } from "@/components/shared/ShareModal";
import { EpisodeDurationBadge } from "@/components/episode/EpisodeDurationBadge";
import { EpisodeTypeBadge } from "@/components/episode/EpisodeTypeBadge";
import { formatRelativeDate, formatYoutubeStats } from "@/lib/format";
import { useAppSelector } from "@/store/hooks";
import { useLikePodcastMutation, useUnlikePodcastMutation } from "@/store/api";
import type { Podcast } from "@/types/podcast";
import { cn } from "@/lib/utils";

import { useBookmark } from "@/features/bookmarks/useBookmark";

export type EpisodeCardVariant =
  | "vertical"
  | "horizontal"
  | "featured"
  | "grid"
  | "sidebar";

const episodeCardActionBtnClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface p-0 text-text-muted shadow-soft transition-transform hover:bg-surface-raised active:scale-95";

interface EpisodeCardProps {
  podcast: Podcast;
  variant?: EpisodeCardVariant;
  className?: string;
  mediaClassName?: string;
  /** Disables cutout hover elevation and action button hovers (detail page). */
  disableHover?: boolean;
}

function EpisodeCutoutCard({
  podcast,
  className,
  mediaClassName,
  disableHover = false,
}: {
  podcast: Podcast;
  className?: string;
  mediaClassName?: string;
  disableHover?: boolean;
}) {
  const { t } = useTranslation(["episodes", "player"]);
  const navigate = useNavigate();
  const language = useAppSelector((s) => s.ui.language);
  const auth = useAppSelector((s) => s.auth);
  const isSubscribed = auth.status === "subscribed" && Boolean(auth.user?.token);
  const stagger = useCutoutContentStaggerVariants();

  const imageUrl = podcast.image ?? "/logo.png";
  const categoryName = podcast.category?.name;
  const isVideo = Boolean(podcast.video);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/podcasts/${podcast.id}`
      : `/podcasts/${podcast.id}`;

  const [liked, setLiked] = useState(Boolean(podcast.liked));
  const { bookmarked, toggleBookmark } = useBookmark(podcast.id);
  const [likePodcast] = useLikePodcastMutation();
  const [unlikePodcast] = useUnlikePodcastMutation();

  useEffect(() => {
    setLiked(Boolean(podcast.liked));
  }, [podcast.liked, podcast.id]);

  const statsLine = formatYoutubeStats(
    podcast.views ?? 0,
    podcast.likes ?? 0,
    language,
    { views: t("episodes:views"), likes: t("episodes:likes") },
  );
  const publishedAgo = formatRelativeDate(podcast.created_at, language);

  const handleCardNavigate = useCallback(() => {
    navigate(`/podcasts/${podcast.id}`);
  }, [navigate, podcast.id]);

  const handleLike = useCallback(
    async (event: MouseEvent) => {
      event.stopPropagation();
      if (!isSubscribed) {
        navigate("/subscribe?reason=like_requires_subscription");
        return;
      }
      const next = !liked;
      setLiked(next);
      try {
        if (next) await likePodcast(podcast.id).unwrap();
        else await unlikePodcast(podcast.id).unwrap();
      } catch {
        setLiked(!next);
      }
    },
    [isSubscribed, liked, likePodcast, navigate, podcast.id, unlikePodcast],
  );

  const handleBookmark = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      void toggleBookmark();
    },
    [toggleBookmark],
  );

  const actionBtnClass = disableHover
    ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface p-0 text-text-muted active:scale-95"
    : episodeCardActionBtnClass;

  return (
    <CutoutCard
      className={cn(
        disableHover ? "w-full rounded-[28px] border border-border bg-surface" : cutoutCardSurfaceClassName,
        "w-full",
        className,
      )}
      trackPointerHover={!disableHover}
      onClick={handleCardNavigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardNavigate();
        }
      }}
      role="link"
      tabIndex={0}
    >
      <CutoutCardMedia className={cn("relative h-[300px]", mediaClassName)}>
        <CutoutCardImage src={imageUrl} alt={podcast.name} loading="lazy"  className="w-full h-full object-cover"/>
        <CutoutCardOverlay />
        {podcast.duration && (
          <EpisodeDurationBadge
            duration={podcast.duration}
            className="absolute bottom-3 end-3 z-10"
          />
        )}
        {categoryName && (
          <CutoutCardInsetLabel className="bottom-0 start-0 z-10 rounded-te-[20px] bg-surface px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
              {categoryName}
            </span>
            <CutoutCorner className="absolute -end-[31px] -bottom-px rotate-90 text-surface" />
            <CutoutCorner className="absolute -top-[31px] -start-px rotate-90 text-surface" />
          </CutoutCardInsetLabel>
        )}
        <CutoutCardPin className="top-3 start-3 z-10 bg-transparent p-0 shadow-none ring-0">
          <EpisodeTypeBadge isVideo={isVideo} />
        </CutoutCardPin>
      </CutoutCardMedia>

      <CutoutCardContent className="p-5">
        <motion.div
          animate="show"
          className="contents"
          initial="hidden"
          variants={stagger.container}
        >
          <motion.h2
            className="mb-2 line-clamp-2 min-h-[3rem] text-balance text-lg font-semibold leading-snug text-text"
            variants={stagger.item}
          >
            {podcast.name}
          </motion.h2>
          {podcast.description && (
            <motion.p
              className="mb-4 line-clamp-2 text-pretty text-sm leading-relaxed text-text-muted"
              variants={stagger.item}
            >
              {podcast.description}
            </motion.p>
          )}
          <motion.div variants={stagger.item}>
            <CutoutCardFooter
              className={cn(
                "items-center gap-3 border-t pt-4",
                podcast.description ? "" : "mt-0",
              )}
              style={{ borderColor: "color-mix(in srgb, var(--color-border) 80%, transparent)" }}
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-xs leading-snug tabular-nums text-text-muted">{statsLine}</p>
                {publishedAgo && (
                  <p className="text-xs leading-snug text-text-muted">{publishedAgo}</p>
                )}
              </div>

              <div
                className="flex shrink-0 items-center gap-1.5"
                role="group"
                aria-label={t("player:cardActions")}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={cn(
                    actionBtnClass,
                    liked && "border-primary/30 bg-primary/10 text-primary",
                  )}
                  aria-label={t("player:like")}
                  onClick={handleLike}
                >
                  <Heart className="h-4 w-4" weight={liked ? "fill" : "regular"} />
                </button>
                <ShareModal
                  title={podcast.name}
                  url={shareUrl}
                  triggerVariant="icon"
                  className={actionBtnClass}
                />
                <button
                  type="button"
                  className={cn(
                    actionBtnClass,
                    bookmarked && "border-primary/30 bg-primary/10 text-primary",
                  )}
                  aria-label={t("player:bookmark")}
                  onClick={handleBookmark}
                >
                  <BookmarkSimple className="h-4 w-4" weight={bookmarked ? "fill" : "regular"} />
                </button>
              </div>
            </CutoutCardFooter>
          </motion.div>
        </motion.div>
      </CutoutCardContent>
    </CutoutCard>
  );
}

export const EpisodeCard = memo(function EpisodeCard({
  podcast,
  variant = "vertical",
  className,
  mediaClassName,
  disableHover = false,
}: EpisodeCardProps) {
  if (variant === "sidebar") {
    return (
      <EpisodeCutoutCard
        podcast={podcast}
        className={cn("w-full shrink-0", className)}
        disableHover={disableHover}
      />
    );
  }

  if (variant === "horizontal") {
    return (
      <EpisodeCutoutCard
        podcast={podcast}
        className={cn("max-w-full", className)}
        mediaClassName={mediaClassName ?? "h-32"}
        disableHover={disableHover}
      />
    );
  }

  if (variant === "featured") {
    return (
      <EpisodeCutoutCard
        podcast={podcast}
        className={cn("min-w-[280px] md:min-w-[480px]", className)}
        mediaClassName={mediaClassName ?? "h-56 md:h-64"}
        disableHover={disableHover}
      />
    );
  }

  return (
    <EpisodeCutoutCard
      podcast={podcast}
      className={cn(
        variant === "grid" ? "w-full" : "w-72 shrink-0 sm:w-80",
        className,
      )}
      mediaClassName={mediaClassName}
      disableHover={disableHover}
    />
  );
});
