import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className="is-page">
      <section className="is-section flex min-h-[50vh] items-center justify-center px-4">
        <EmptyState
          code="404"
          title={t("notFound.title")}
          description={t("notFound.description")}
          actionLabel={t("actions.backHome")}
          actionTo="/"
        />
      </section>
    </main>
  );
}
