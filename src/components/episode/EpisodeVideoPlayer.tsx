import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface EpisodeVideoPlayerProps {
  src: string;
  poster?: string | null;
  className?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialPosition?: number;
}

export function EpisodeVideoPlayer({
  src,
  poster,
  className,
  onTimeUpdate,
  initialPosition = 0,
}: EpisodeVideoPlayerProps) {
  const { t } = useTranslation("player");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const resumedRef = useRef(false);

  const syncTime = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setProgress(video.currentTime);
    setSeekValue(video.currentTime);
    setDuration(video.duration || 0);
    onTimeUpdate?.(video.currentTime, video.duration || 0);
  }, [onTimeUpdate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || resumedRef.current || initialPosition <= 0) return;

    const applyResume = () => {
      if (video.duration > 0 && initialPosition < video.duration - 2) {
        video.currentTime = initialPosition;
        setProgress(initialPosition);
        setSeekValue(initialPosition);
        resumedRef.current = true;
      }
    };

    if (video.readyState >= 1) applyResume();
    else video.addEventListener("loadedmetadata", applyResume, { once: true });
  }, [initialPosition, src]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setIsPlaying(true)).catch(() => undefined);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const video = videoRef.current;
    const next = value[0] ?? 0;
    setSeekValue(next);
    if (!video) return;
    video.currentTime = next;
    setProgress(next);
  }, []);

  return (
    <div className={cn("group relative w-full bg-zinc-950", className)}>
      <video
        ref={videoRef}
        id="episode-video"
        src={src}
        poster={poster ?? undefined}
        playsInline
        className="aspect-video w-full object-contain"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={syncTime}
        onLoadedMetadata={syncTime}
        onEnded={() => setIsPlaying(false)}
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-black/70 px-3 py-3 opacity-0 transition-opacity duration-200",
          "group-hover:pointer-events-auto group-hover:opacity-100",
          "group-focus-within:pointer-events-auto group-focus-within:opacity-100",
        )}
      >
        <Slider
          value={[seekValue]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          aria-label={t("seek")}
          className="[&_[role=slider]]:border-primary [&_[role=slider]]:shadow-none"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-white active:scale-95"
            onClick={togglePlay}
            aria-label={isPlaying ? t("pause") : t("play")}
          >
            {isPlaying ? (
              <Pause weight="fill" className="h-5 w-5" />
            ) : (
              <Play weight="fill" className="h-5 w-5" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-white active:scale-95"
            onClick={toggleMute}
            aria-label={t("volume")}
          >
            {isMuted ? (
              <SpeakerSlash className="h-5 w-5" />
            ) : (
              <SpeakerHigh className="h-5 w-5" />
            )}
          </Button>
          <span className="ms-auto font-mono text-xs tabular-nums text-white/90">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
