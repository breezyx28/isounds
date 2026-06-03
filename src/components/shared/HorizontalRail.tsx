import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { EpisodeCard } from "./EpisodeCard";
import { RailSkeleton } from "./RailSkeleton";
import { useGetTopPodcastsQuery } from "@/store/api";
import type { TopCriteria } from "@/types/podcast";
import { Button } from "@/components/ui/button";

interface HorizontalRailProps {
  title: string;
  criteria: TopCriteria;
  viewAllTo?: string;
  featured?: boolean;
  categoryId?: number;
  hideViewAll?: boolean;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function HorizontalRail({
  title,
  criteria,
  viewAllTo = "/explore",
  featured = false,
  categoryId,
  hideViewAll = false,
}: HorizontalRailProps) {
  const { t } = useTranslation();
  const { data = [], isLoading, isError, refetch } = useGetTopPodcastsQuery({
    criteria,
    categoryId,
  });

  return (
    <section className="mx-auto my-10 max-w-7xl md:my-14">
      <div className="mb-5 flex items-center justify-between px-4 md:px-8 xl:px-16">
        <h2 className="text-display-md font-semibold tracking-tight text-text">{title}</h2>
        {!hideViewAll && (
          <Button variant="ghost" size="sm" asChild>
            <Link to={viewAllTo}>{t("actions.viewAll")}</Link>
          </Button>
        )}
      </div>

      {isLoading && <RailSkeleton />}

      {isError && (
        <div className="px-4 md:px-8 xl:px-16">
          <div className="rounded-xl border border-border/70 bg-surface/60 p-5 text-center">
            <p className="text-body-md text-text-muted">{t("errors.loadFailed")}</p>
            <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>
              {t("actions.tryAgain")}
            </Button>
          </div>
        </div>
      )}

      {!isLoading && !isError && data.length === 0 && (
        <div className="px-4 md:px-8 xl:px-16">
          <div className="rounded-xl border border-dashed border-border/70 bg-surface/40 p-5 text-body-md text-text-muted">
            {t("empty.episodes")}
          </div>
        </div>
      )}

      {!isLoading && !isError && data.length > 0 && (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-none md:px-8 xl:px-16"
          style={{ scrollbarWidth: "none" }}
        >
          {featured && data[0] ? (
            <motion.div variants={item}>
              <EpisodeCard podcast={data[0]} variant="featured" />
            </motion.div>
          ) : (
            data.map((podcast) => (
              <motion.div key={podcast.id} variants={item}>
                <EpisodeCard podcast={podcast} variant="vertical" />
              </motion.div>
            ))
          )}
          {featured &&
            data.slice(1, 4).map((podcast) => (
              <motion.div key={podcast.id} variants={item}>
                <EpisodeCard podcast={podcast} variant="vertical" />
              </motion.div>
            ))}
        </motion.div>
      )}
    </section>
  );
}
