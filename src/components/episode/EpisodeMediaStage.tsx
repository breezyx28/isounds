import { useCallback, useEffect, type MouseEvent } from "react";
import {
  BookmarkSimple,
  Heart,
  Pause,
  Play,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EpisodeTypeBadge } from "@/components/episode/EpisodeTypeBadge";
import { AudioWaveBars } from "@/components/episode/AudioWaveBars";
import { EpisodeVideoPlayer } from "@/components/episode/EpisodeVideoPlayer";
import { ShareModal } from "@/components/shared/ShareModal";
import { SubscribeGate } from "@/components/shared/SubscribeGate";
import { usePlayer } from "@/features/player/usePlayer";
import { cn } from "@/lib/utils";
import type { Podcast } from "@/types/podcast";

import { useBookmark } from "@/features/bookmarks/useBookmark";

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const posterActionClass =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white active:scale-95";

interface EpisodeMediaStageProps {
  podcast: Podcast;
  isSubscribed: boolean;
  shareUrl: string;
  liked: boolean;
  onLike: () => void;
  canResume?: boolean;
  resumeSeconds?: number;
  onResume?: () => void;
  onVideoTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function EpisodeMediaStage({
  podcast,
  isSubscribed,
  shareUrl,
  liked,
  onLike,
  canResume,
  resumeSeconds = 0,
  onResume,
  onVideoTimeUpdate,
}: EpisodeMediaStageProps) {
  const { t } = useTranslation("player");
  const navigate = useNavigate();
  const { player, play, pause, seek, playEpisode } = usePlayer();
  const { bookmarked, toggleBookmark } = useBookmark(podcast.id);

  const imageUrl = podcast.image ?? "/logo.png";
  const isVideo = Boolean(podcast.video);
  const isCurrentEpisode = player.currentEpisode?.id === podcast.id;
  const isPlaying = isCurrentEpisode && player.isPlaying;
  const showAudioControls = isSubscribed && !isVideo && isCurrentEpisode;
  const progressPct =
    player.duration > 0 ? (player.progress / player.duration) * 100 : 0;

  useEffect(() => {
    if (!isSubscribed || isVideo) return;
    if (player.currentEpisode?.id !== podcast.id) {
      playEpisode(podcast);
    }
  }, [isSubscribed, isVideo, playEpisode, player.currentEpisode?.id, podcast]);

  const handlePlay = useCallback(() => {
    if (!isSubscribed) {
      navigate("/subscribe?reason=listen_requires_subscription");
      return;
    }
    if (isVideo) {
      const el = document.getElementById("episode-video");
      if (el instanceof HTMLVideoElement) {
        if (el.paused) void el.play().catch(() => undefined);
        else el.pause();
      }
      return;
    }
    if (player.currentEpisode?.id !== podcast.id) {
      playEpisode(podcast);
      return;
    }
    if (isPlaying) pause();
    else play();
  }, [
    isPlaying,
    isSubscribed,
    isVideo,
    navigate,
    pause,
    play,
    playEpisode,
    player.currentEpisode?.id,
    podcast,
  ]);

  const handleLikeClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onLike();
    },
    [onLike],
  );

  const handleBookmark = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      void toggleBookmark();
    },
    [toggleBookmark],
  );

  const handleSeekClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!player.duration) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      seek(ratio * player.duration);
    },
    [player.duration, seek],
  );

  return (
    <div className="relative min-h-[min(56vw,28rem)] w-full overflow-hidden md:min-h-[22rem]">
      {!isVideo || !isSubscribed ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      ) : null}

      {isVideo && isSubscribed ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center">
          <EpisodeVideoPlayer
            src={podcast.video!}
            poster={imageUrl}
            className="h-full w-full"
            initialPosition={resumeSeconds}
            onTimeUpdate={onVideoTimeUpdate}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "absolute inset-0 z-[2]",
          isVideo && isSubscribed ? "bg-black/25" : "bg-black/55",
        )}
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col">
        <div className="pointer-events-auto flex items-start justify-between gap-3 p-4">
          <EpisodeTypeBadge isVideo={isVideo} />
          {podcast.category?.name ? (
            <Badge
              variant="secondary"
              className="border-white/25 bg-black/40 text-[10px] font-semibold uppercase tracking-wide text-white"
            >
              {podcast.category.name}
            </Badge>
          ) : (
            <span />
          )}
        </div>

        <div className="pointer-events-auto -mt-1 flex justify-end gap-2 px-4">
          <button
            type="button"
            className={cn(
              posterActionClass,
              liked && "border-primary bg-primary/30 text-primary",
            )}
            aria-label={t("like")}
            onClick={handleLikeClick}
          >
            <Heart className="h-5 w-5" weight={liked ? "fill" : "regular"} />
          </button>
          <ShareModal
            title={podcast.name}
            url={shareUrl}
            triggerVariant="icon"
            className={posterActionClass}
          />
          <button
            type="button"
            className={cn(
              posterActionClass,
              bookmarked && "border-primary bg-primary/30 text-primary",
            )}
            aria-label={t("bookmark")}
            onClick={handleBookmark}
          >
            <BookmarkSimple className="h-5 w-5" weight={bookmarked ? "fill" : "regular"} />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {!isSubscribed || isVideo ? null : (
            <Button
              type="button"
              size="icon"
              variant="primary"
              className="pointer-events-auto h-16 w-16 rounded-full active:scale-95"
              onClick={handlePlay}
              aria-label={isPlaying ? t("pause") : t("play")}
            >
              {isPlaying ? (
                <Pause weight="fill" className="h-7 w-7" />
              ) : (
                <Play weight="fill" className="h-7 w-7 ms-0.5" />
              )}
            </Button>
          )}
        </div>

        {showAudioControls && (
          <div className="pointer-events-auto space-y-3 px-4 pb-4">
            <AudioWaveBars isPlaying={isPlaying} />
            <div className="flex items-center justify-between font-mono text-xs tabular-nums text-white/90">
              <span>{formatTime(player.progress)}</span>
              <span>{formatTime(player.duration)}</span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={player.duration || 100}
              aria-valuenow={player.progress}
              className="h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/25"
              onClick={handleSeekClick}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {canResume && onResume && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-white/90 active:scale-95"
                onClick={onResume}
              >
                {t("resumeFrom", { time: formatTime(resumeSeconds) })}
              </Button>
            )}
          </div>
        )}
      </div>

      {!isSubscribed && (
        <div className="absolute inset-0 z-[4] flex items-center justify-center bg-black/55 p-6">
          <SubscribeGate className="max-w-md border-white/20 bg-black/40 text-white [&_p]:text-white/90" />
        </div>
      )}
    </div>
  );
}
