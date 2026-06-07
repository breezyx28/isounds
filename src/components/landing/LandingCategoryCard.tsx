import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CountUpNumber } from "@/components/shared/CountUpNumber";
import { getCategoryColor } from "@/lib/categoryColors";
import { formatPodcastCountPlus, getCategoryIconComponent } from "@/lib/categoryIcons";
import type { Category } from "@/types/category";
import { cn } from "@/lib/utils";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80",
];

const CARD_ICON_COLOR = "#ffffff";

type LandingCategoryCardProps = {
  category: Category;
  index: number;
  className?: string;
};

function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace("إقتصاد", "اقتصاد")
    .replace("أقتصاد", "اقتصاد");
}

function getTranslatedCategoryLabel(
  rawName: string,
  t: (key: string, options?: { defaultValue?: string }) => string,
): string {
  const normalized = normalizeCategoryName(rawName);
  const map: Record<string, string> = {
    "قضايا المرأة": "womenIssues",
    فن: "arts",
    "سياسة و اقتصاد": "politicsEconomy",
    "مراجعات ثقافية": "culturalReviews",
    رياضة: "sports",
  };

  const key = map[normalized];
  if (!key) return rawName;
  return t(`landing.categories.labels.${key}`, { defaultValue: rawName });
}

function getCategoryImage(category: Category, index: number): string {
  const name = category.name.toLowerCase();
  if (/sport|رياضة|رياضه/i.test(name))
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80";
  if (/news|أخبار|اخبار|سياسة|politic/i.test(name))
    return "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80";
  if (/music|موسيق|اغاني|أغاني/i.test(name))
    return "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80";
  if (/business|econom|اقتصاد|مال/i.test(name))
    return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";
  if (/health|صحة|wellness|mental/i.test(name))
    return "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80";
  if (/tech|technology|تكنولوج/i.test(name))
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80";
  if (/kids|أطفال|اطفال|family|عائلة/i.test(name))
    return "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80";
  if (/culture|ثقاف|history|تراث/i.test(name))
    return "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80";
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]!;
}

export function LandingCategoryCard({
  category,
  index,
  className,
}: LandingCategoryCardProps) {
  const { t } = useTranslation();
  const categoryLabel = getTranslatedCategoryLabel(category.name, t);
  const imageSrc = getCategoryImage(category, index);
  const Icon = getCategoryIconComponent(category, index);
  const podcastCountValue =
    category.total_podcasts != null && category.total_podcasts > 0
      ? category.total_podcasts
      : 10;
  const podcastCountLabel = formatPodcastCountPlus(category.total_podcasts) ?? "10+";
  const accent = category.color ?? getCategoryColor(category.id);

  return (
    <article
      className={cn(
        "relative aspect-square h-full w-full min-h-0 overflow-hidden rounded-2xl",
        className,
      )}
    >
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 15%, transparent) 0%, rgba(12,10,20,0.35) 45%, rgba(12,10,20,0.82) 100%)`,
        }}
      />

      <Link
        to={`/categories/${category.id}`}
        className="absolute inset-0 z-20 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        aria-label={
          podcastCountLabel
            ? t("landing.categories.cardAria", {
                name: categoryLabel,
                count: podcastCountLabel,
              })
            : categoryLabel
        }
      />

      <div className="relative z-10 flex h-full flex-col p-2.5 sm:p-3">
        <span className="inline-flex w-fit items-center gap-x-1.5 rounded-full bg-primary px-2.5 py-1.5 text-[9px] font-semibold leading-none text-white sm:text-[10px]">
          <Icon size={14} color={CARD_ICON_COLOR} variant="Bulk" />
          <span className="line-clamp-1">{categoryLabel}</span>
        </span>

        <div className="mt-auto">
          {podcastCountLabel ? (
            <>
              <p className="text-[clamp(1.25rem,4vw,1.75rem)] font-black leading-none tracking-tight text-white">
                <CountUpNumber value={podcastCountValue} className="text-white" />
              </p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/75 sm:text-[10px]">
                {t("landing.categories.podcastsLabel")}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold leading-tight text-white sm:text-base">
              {categoryLabel}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
