import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <main className="is-page is-page--narrow">
      <section className="is-section space-y-8">
      <h1 className="text-display-md font-semibold text-text">{t("terms.title")}</h1>
      <p className="text-body-lg text-text-muted">{t("terms.intro")}</p>

      <section>
        <h2 className="text-heading-lg font-semibold text-text">{t("terms.usageTitle")}</h2>
        <p className="mt-2 text-body-md text-text-muted">{t("terms.usageBody")}</p>
      </section>

      <section>
        <h2 className="text-heading-lg font-semibold text-text">{t("terms.subscriptionTitle")}</h2>
        <p className="mt-2 text-body-md text-text-muted">{t("terms.subscriptionBody")}</p>
      </section>
      </section>
    </main>
  );
}
