import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, X } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { usePlayer } from "@/features/player/usePlayer";

export function MiniPlayer() {
  const { t } = useTranslation("player");
  const { player, play, pause, dismiss, openEpisode } = usePlayer();

  if (!player.currentEpisode) return null;

  const progressPercent =
    player.duration > 0 ? (player.progress / player.duration) * 100 : 0;

  return (
    <AnimatePresence>
      {player.showMiniPlayer && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-16 z-50 border-t border-border bg-surface-raised/95 pb-safe backdrop-blur md:bottom-0"
        >
          <div
            className="mx-auto flex h-[72px] max-w-7xl cursor-pointer items-center gap-3 px-4 md:h-20 md:px-8 xl:px-16"
            onClick={() => openEpisode(player.currentEpisode!.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openEpisode(player.currentEpisode!.id);
              }
            }}
            aria-label={t("openMiniPlayerEpisode")}
          >
            <img
              src={player.currentEpisode.image ?? "/logo.png"}
              alt={player.currentEpisode.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md text-text">
                {player.currentEpisode.name}
              </p>
              <div className="mt-1 h-1 w-full rounded-full bg-border">
                <div
                  className="h-1 rounded-full bg-primary"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (player.isPlaying) pause();
                else play();
              }}
              className="rounded-md border border-border p-2 text-text"
              aria-label={player.isPlaying ? t("pause") : t("play")}
            >
              {player.isPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                dismiss();
              }}
              className="rounded-md border border-border p-2 text-text-muted"
              aria-label={t("closeMiniPlayer")}
            >
              <X />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
