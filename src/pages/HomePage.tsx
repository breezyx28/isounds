import { useTranslation } from "react-i18next";
import { HorizontalRail } from "@/components/shared/HorizontalRail";
import { CategoryTile } from "@/components/shared/CategoryTile";
import { useGetCategoriesQuery } from "@/store/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useGetCategoriesQuery();

  return (
    <main className="pb-6">
      <HorizontalRail
        title={t("sections.featured")}
        criteria="viewed"
        featured
        viewAllTo="/explore?sort=viewed"
      />
      <HorizontalRail
        title={t("sections.latest")}
        criteria="latest"
        viewAllTo="/explore?sort=latest"
      />
      <HorizontalRail
        title={t("sections.liked")}
        criteria="liked"
        viewAllTo="/explore?sort=liked"
      />
      <HorizontalRail
        title={t("sections.viewed")}
        criteria="viewed"
        viewAllTo="/explore?sort=viewed"
      />

      <section className="mx-auto my-10 max-w-7xl px-4 md:my-14 md:px-8 xl:px-16">
        <h2 className="mb-5 text-display-md font-semibold tracking-tight text-text">
          {t("sections.categories")}
        </h2>
        {isLoading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        )}
        {!isLoading && categories.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 bg-surface/40 p-6 text-body-md text-text-muted">
            {t("empty.categories")}
          </div>
        )}
        {!isLoading && categories.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <CategoryTile key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
