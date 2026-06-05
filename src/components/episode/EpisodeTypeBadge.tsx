import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { AudioLines } from "../animate-ui/icons/audio-lines";
import { VideoCircle } from "iconsax-react";

interface EpisodeTypeBadgeProps {
  isVideo: boolean;
  className?: string;
}

export function EpisodeTypeBadge({ isVideo, className }: EpisodeTypeBadgeProps) {
  const { t } = useTranslation("episodes");

  if (isVideo) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 font-semibold uppercase tracking-wide text-white",
          className,
        )}
      >
        <VideoCircle size={12} color="white" variant="Bold" /> 
        <span className="text-[10px]">
           {t("video")}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 font-semibold uppercase tracking-wide text-white",
        className,
      )}
    >
      {/* <Microphone className="h-3 w-3" weight="fill" aria-hidden /> */}
      <AudioLines size={12} aria-hidden />
      <span className="text-[10px]">
      {t("audio")}
      </span>
    </span>
  );
}
