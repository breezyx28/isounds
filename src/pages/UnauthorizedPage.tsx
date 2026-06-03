import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/shared/EmptyState";

export default function UnauthorizedPage() {
  const { t } = useTranslation();

  return (
    <main className="is-page">
      <section className="is-section flex min-h-[50vh] items-center justify-center px-4">
        <EmptyState
          code="401"
          title={t("auth.subscriptionRequired")}
          description={t("auth.subscribeBody")}
          actionLabel={t("auth.subscribeNow")}
          actionTo="/subscribe"
        />
      </section>
    </main>
  );
}
