import { Pause, Play } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlayer } from "./usePlayer";

function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function FullPlayer() {
  const { t } = useTranslation("player");
  const { player, play, pause, seek, setVolume, setPlaybackRate } = usePlayer();

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center gap-4">
        <Button
          type="button"
          size="icon"
          variant="primary"
          className="h-14 w-14 shrink-0 rounded-full"
          onClick={player.isPlaying ? pause : play}
          aria-label={player.isPlaying ? t("pause") : t("play")}
        >
          {player.isPlaying ? (
            <Pause weight="fill" className="h-6 w-6" />
          ) : (
            <Play weight="fill" className="h-6 w-6" />
          )}
        </Button>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between text-label text-text-muted">
            <span>{formatTime(player.progress)}</span>
            <span>{formatTime(player.duration)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={player.duration || 0}
            value={player.progress}
            onChange={(event) => seek(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
            aria-label={t("seek")}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-label text-text-muted">
          {t("volume")}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={player.volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-24 accent-primary"
          />
        </label>

        <div className="flex items-center gap-2 text-label text-text-muted">
          {t("speed")}
          <div className="flex flex-wrap gap-1">
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackRate(speed)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-label transition-colors",
                  player.playbackRate === speed
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-text-muted hover:bg-surface-raised",
                )}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
