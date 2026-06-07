import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Category as CategoryIcon } from "iconsax-react";
import { ArrowUpRight, ClockCounterClockwise, Eye, Heart, Sparkle } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useGetCategoriesQuery } from "@/store/api";
import { useTopicChipCounts } from "@/hooks/useTopicChipCounts";
import { FrostGlassChip } from "@/components/ui/frost-glass-chip";
import { LandingCategoryCard } from "./LandingCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CountUpNumber } from "@/components/shared/CountUpNumber";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";

const CHIP_ICON_COLOR = "#7b4ab4";
const BENTO_GRID_CLASS =
  "grid w-full grid-cols-3 gap-2 sm:gap-2.5 md:gap-3";
const BENTO_GRID_WRAP_CLASS = "mx-auto w-full max-w-[min(100%,36rem)] sm:max-w-md md:max-w-xl lg:max-w-2xl";

type GridItem =
  | { kind: "category"; category: Category; categoryIndex: number }
  | { kind: "topic"; topic: "latest" | "liked" | "viewed" }
  | { kind: "filler"; id: string };

function buildGridItems(categories: Category[]): GridItem[] {
  const topics: Array<"latest" | "liked" | "viewed"> = ["latest", "liked", "viewed"];
  const items: GridItem[] = [];
  let topicIndex = 0;

  categories.forEach((category, index) => {
    items.push({ kind: "category", category, categoryIndex: index });
    if ((index + 1) % 2 === 0 && topicIndex < topics.length) {
      items.push({ kind: "topic", topic: topics[topicIndex]! });
      topicIndex += 1;
    }
  });

  while (topicIndex < topics.length) {
    items.push({ kind: "topic", topic: topics[topicIndex]! });
    topicIndex += 1;
  }

  while (items.length < 9) {
    items.push({ kind: "filler", id: `filler-${items.length}` });
  }

  return items.slice(0, 9);
}

function TopicCard({
  label,
  description,
  count,
  to,
  className,
  icon,
  animationDelay,
  reducedMotion,
}: {
  label: string;
  description: string;
  count: number;
  to: string;
  className: string;
  icon: ReactNode;
  animationDelay: number;
  reducedMotion: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex aspect-square h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl p-2.5 sm:p-3",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <motion.img
        src="/logos/isounds-icon-primary.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -end-10 -top-8 h-32 w-32 opacity-20 blur-[1.5px]"
        initial={reducedMotion ? { opacity: 0.16 } : { opacity: 0, scale: 0.82, rotate: -20, y: -10 }}
        whileInView={
          reducedMotion
            ? { opacity: 0.2 }
            : { opacity: 0.2, scale: 1.08, rotate: 6, y: 0, transition: { delay: animationDelay, duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
        }
        viewport={{ once: true, amount: 0.4 }}
      />
      <div className="flex items-start justify-between">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#1d1330]">
          {icon}
        </span>
        <ArrowUpRight className="h-4 w-4 text-current opacity-80" weight="bold" />
      </div>
      <div className="mt-auto">
        <p className="text-[clamp(1.4rem,5vw,2.15rem)] font-black leading-none tracking-tight">
          <CountUpNumber value={count} />
        </p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-85 sm:text-xs">
          {label}
        </p>
        <p className="mt-1 line-clamp-2 text-[10px] leading-snug opacity-80 sm:text-xs">
          {description}
        </p>
      </div>
    </Link>
  );
}

export function LandingCategoriesSection({ className }: { className?: string }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const { data: categories = [], isLoading, isError, refetch } =
    useGetCategoriesQuery();
  const topicCounts = useTopicChipCounts();

  const gridItems = useMemo(() => buildGridItems(categories), [categories]);

  return (
    <section
      id="categories"
      className={cn(
        "section-container flex min-h-[100dvh] flex-col py-10 md:py-12",
        className,
      )}
      aria-labelledby="landing-categories-heading"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-5 md:gap-6">
        <FrostGlassChip
          as="h2"
          id="landing-categories-heading"
          className="gap-x-3 text-[12px] leading-none text-black/80"
        >
          <CategoryIcon size={18} color={CHIP_ICON_COLOR} variant="Bulk" />
          {t("landing.categories.chip")}
        </FrostGlassChip>

        <div className="flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <p className="max-w-md text-body-lg leading-relaxed text-text-muted lg:max-w-sm">
            {t("landing.categories.intro")}
          </p>
        </div>

        {isLoading && (
          <div className={cn("flex flex-1 items-center justify-center", BENTO_GRID_WRAP_CLASS)}>
            <div className={BENTO_GRID_CLASS}>
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-surface-raised/50 p-8 text-center">
            <div>
              <p className="text-text-muted">{t("errors.loadFailed")}</p>
              <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
                {t("actions.tryAgain")}
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <div className={cn("flex flex-1 items-center justify-center", BENTO_GRID_WRAP_CLASS)}>
            <div className={BENTO_GRID_CLASS} role="list">
              {gridItems.map((item) => (
                /* smooth in-view stagger for logo patterns */
                <div
                  key={
                    item.kind === "category"
                      ? `cat-${item.category.id}`
                      : item.kind === "topic"
                        ? `topic-${item.topic}`
                        : item.id
                  }
                  role="listitem"
                  className="min-h-0"
                >
                  {item.kind === "category" && (
                    <LandingCategoryCard category={item.category} index={item.categoryIndex} />
                  )}
                  {item.kind === "topic" && item.topic === "latest" && (
                    <TopicCard
                      label={t("sections.latest")}
                      description={t("landing.categories.topicCards.latest")}
                      count={topicCounts.latest}
                      to="/explore?sort=latest"
                      className="bg-[#eaf0ff] text-[#2a3a77]"
                      icon={<ClockCounterClockwise className="h-4 w-4" weight="bold" />}
                      animationDelay={0.06 * 1}
                      reducedMotion={reducedMotion}
                    />
                  )}
                  {item.kind === "topic" && item.topic === "liked" && (
                    <TopicCard
                      label={t("sections.liked")}
                      description={t("landing.categories.topicCards.liked")}
                      count={topicCounts.liked}
                      to="/explore?sort=liked"
                      className="bg-[#ffeaf3] text-[#6a2345]"
                      icon={<Heart className="h-4 w-4" weight="fill" />}
                      animationDelay={0.06 * 2}
                      reducedMotion={reducedMotion}
                    />
                  )}
                  {item.kind === "topic" && item.topic === "viewed" && (
                    <TopicCard
                      label={t("sections.viewed")}
                      description={t("landing.categories.topicCards.viewed")}
                      count={topicCounts.viewed}
                      to="/explore?sort=viewed"
                      className="bg-[#e7fff2] text-[#1d5a3a]"
                      icon={<Eye className="h-4 w-4" weight="bold" />}
                      animationDelay={0.06 * 3}
                      reducedMotion={reducedMotion}
                    />
                  )}
                  {item.kind === "filler" && (
                    <article className="relative flex aspect-square h-full w-full min-h-0 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#f4effd] via-[#efe8fb] to-[#e9defa] p-2.5 text-[#5a3b8f] sm:p-3">
                      <motion.img
                        src="/logos/isounds-icon-primary.svg"
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute -end-10 -top-8 h-32 w-32 opacity-20 blur-[1.5px]"
                        initial={
                          reducedMotion
                            ? { opacity: 0.16 }
                            : { opacity: 0, scale: 0.8, rotate: 18, x: 8, y: -8 }
                        }
                        whileInView={
                          reducedMotion
                            ? { opacity: 0.2 }
                            : {
                                opacity: 0.2,
                                scale: 1.06,
                                rotate: -4,
                                x: 0,
                                y: 0,
                                transition: {
                                  delay: 0.06 * 4,
                                  duration: 0.7,
                                  ease: [0.22, 1, 0.36, 1],
                                },
                              }
                        }
                        viewport={{ once: true, amount: 0.4 }}
                      />
                      <Sparkle className="h-5 w-5 opacity-80" weight="fill" />
                      <div className="mt-auto">
                        <p className="text-[clamp(1.4rem,5vw,2.05rem)] font-black leading-none tracking-tight">
                          iSounds
                        </p>
                        <p className="mt-1 text-[10px] leading-snug opacity-80 sm:text-xs">
                          {t("landing.categories.topicCards.filler")}
                        </p>
                      </div>
                    </article>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <p className="flex flex-1 items-center text-body-md text-text-muted">
            {t("empty.categories")}
          </p>
        )}
      </div>
    </section>
  );
}
