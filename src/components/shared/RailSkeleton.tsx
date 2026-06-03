import { EpisodeCardSkeleton } from "./EpisodeCardSkeleton";

export function RailSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden px-4 md:px-8 xl:px-16">
      {Array.from({ length: 4 }).map((_, i) => (
        <EpisodeCardSkeleton key={i} />
      ))}
    </div>
  );
}
