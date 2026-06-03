import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetPodcastDetailQuery } from "@/store/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeCardSkeleton } from "@/components/shared/EpisodeCardSkeleton";

export default function PodcastStubPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const podcastId = Number(id);
  const { data, isLoading, isError } = useGetPodcastDetailQuery(podcastId, {
    skip: !podcastId || Number.isNaN(podcastId),
  });

  if (isLoading) {
    return (
      <div className="px-4 py-8 md:px-8">
        <Skeleton className="mx-auto aspect-square max-w-sm rounded-2xl" />
        <Skeleton className="mx-auto mt-4 h-8 w-2/3 max-w-md" />
      </div>
    );
  }

  return (
    <div className="px-4 py-12 text-center md:px-8">
      {data?.image && (
        <img
          src={data.image}
          alt={data.name}
          className="mx-auto mb-6 max-h-64 rounded-2xl object-cover"
        />
      )}
      <h1 className="text-display-md font-semibold text-text">
        {data?.name ?? t("stub.episodeTitle")}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-body-lg text-text-muted">
        {t("stub.episodeBody")}
      </p>
      {isError && <EpisodeCardSkeleton variant="vertical" />}
      <Button className="mt-8" variant="secondary" asChild>
        <Link to="/">{t("actions.backHome")}</Link>
      </Button>
    </div>
  );
}
