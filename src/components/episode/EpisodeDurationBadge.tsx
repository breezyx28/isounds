import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Clock } from "iconsax-react";

interface EpisodeDurationBadgeProps {
  duration: string;
  className?: string;
}

/** Thumbnail overlay badge for episode length. */
export function EpisodeDurationBadge({ duration, className }: EpisodeDurationBadgeProps) {
  const label = formatDuration(duration);

  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-white/20 bg-black/70 font-semibold text-white tabular-nums shadow-sm backdrop-blur-sm",
        className,
      )}
      aria-label={label}
    >
      {label}
      <Clock
      size={32}
      color="white"
      variant="Bold"
      />
    </Badge>
  );
}
