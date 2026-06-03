import { useTranslation } from "react-i18next";
import { CategoryTile } from "@/components/shared/CategoryTile";
import { EmptyState } from "@/components/shared/EmptyState";
import { useGetCategoriesQuery } from "@/store/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { data: categories = [], isLoading, isError, refetch } =
    useGetCategoriesQuery();

  return (
    <main className="is-page">
      <section className="is-section">
        <header className="is-section-header">
          <div>
            <h1 className="is-heading-page">{t("nav.categories")}</h1>
            <p className="is-text-lead mt-2">
              {t("landing.categories.intro")}
            </p>
          </div>
        </header>

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="min-h-[14rem] rounded-3xl" />
            ))}
          </div>
        )}

        {isError && (
          <EmptyState
            code="500"
            title={t("errors.loadFailed")}
            actionLabel={t("actions.tryAgain")}
            onAction={() => refetch()}
          />
        )}

        {!isLoading && !isError && categories.length === 0 && (
          <EmptyState code="empty" title={t("empty.categories")} actionTo="/explore" actionLabel={t("nav.explore")} />
        )}

        {!isLoading && !isError && categories.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => (
              <li key={cat.id} className="list-none">
                <CategoryTile category={cat} index={index} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
