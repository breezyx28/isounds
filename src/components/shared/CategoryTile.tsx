import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "motion/react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { getCategoryIconComponent } from "@/lib/categoryIcons";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

interface CategoryTileProps {
  category: Category;
  index?: number;
  className?: string;
}

function getCategoryDescription(
  category: Category,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (category.description?.trim()) {
    return category.description.trim();
  }

  if (category.total_podcasts != null) {
    return t("category.episodeCount", { count: category.total_podcasts });
  }

  return t("landing.categories.topicCards.filler");
}

export const CategoryTile = memo(function CategoryTile({
  category,
  index = 0,
  className,
}: CategoryTileProps) {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const Icon = getCategoryIconComponent(category, index);
  const description = getCategoryDescription(category, t);

  return (
    <Link
      to={`/categories/${category.id}`}
      className={cn(
        "group block min-h-[14rem] rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
      aria-label={
        category.total_podcasts != null
          ? t("landing.categories.cardAria", {
              name: category.name,
              count: `${category.total_podcasts}+`,
            })
          : category.name
      }
    >
      <div className="relative h-full rounded-2xl border border-border/70 p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow
          disabled={prefersReducedMotion === true}
          proximity={64}
          inactiveZone={0.01}
        />
        <div className="relative flex h-full min-h-[12rem] flex-col justify-between gap-6 overflow-hidden rounded-xl bg-surface p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-border/80 bg-primary/10 p-2.5">
              <Icon size={20} color="#9f67db" variant="Bulk" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold leading-snug tracking-tight text-balance text-text md:text-2xl">
                {category.name}
              </h3>
              <p className="text-sm leading-relaxed text-text-muted md:text-base">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});
