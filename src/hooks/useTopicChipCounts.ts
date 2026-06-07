import { useGetTopPodcastsQuery } from "@/store/api";
import { asPodcastList } from "@/lib/podcasts";

function resolveCount(value: number | undefined): number {
  if (!value || value <= 0) return 10;
  return value;
}

export function useTopicChipCounts() {
  const { data: latestData } = useGetTopPodcastsQuery({ criteria: "latest" });
  const { data: likedData } = useGetTopPodcastsQuery({ criteria: "liked" });
  const { data: viewedData } = useGetTopPodcastsQuery({ criteria: "viewed" });

  const latest = asPodcastList(latestData);
  const liked = asPodcastList(likedData);
  const viewed = asPodcastList(viewedData);

  return {
    latest: resolveCount(latest.length),
    liked: resolveCount(liked.length),
    viewed: resolveCount(viewed.length),
  };
}
