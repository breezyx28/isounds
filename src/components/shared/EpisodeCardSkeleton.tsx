import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const EpisodeCardSkeleton = memo(function EpisodeCardSkeleton({
  variant = "vertical",
  mediaClassName,
}: {
  variant?: "vertical" | "horizontal" | "featured";
  mediaClassName?: string;
}) {
  if (variant === "horizontal") {
    if (mediaClassName) {
      return (
        <div className="w-full space-y-3 rounded-[28px] border border-border bg-surface p-5">
          <Skeleton className={cn("w-full rounded-2xl", mediaClassName)} />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );
    }

    return (
      <div className="flex gap-3 rounded-lg border border-border bg-surface p-3">
        <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <Skeleton className="aspect-[16/9] w-full min-w-[280px] rounded-2xl md:min-w-[480px]" />
    );
  }

  return (
    <div className={cn("w-40 shrink-0 space-y-2 md:w-44")}>
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
});
