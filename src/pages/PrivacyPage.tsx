import { useTranslation } from "react-i18next";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <main className="is-page is-page--narrow">
      <section className="is-section space-y-8">
      <h1 className="text-display-md font-semibold text-text">{t("privacy.title")}</h1>
      <p className="text-body-lg text-text-muted">{t("privacy.intro")}</p>

      <section>
        <h2 className="text-heading-lg font-semibold text-text">{t("privacy.dataTitle")}</h2>
        <p className="mt-2 text-body-md text-text-muted">{t("privacy.dataBody")}</p>
      </section>

      <section>
        <h2 className="text-heading-lg font-semibold text-text">{t("privacy.rightsTitle")}</h2>
        <p className="mt-2 text-body-md text-text-muted">{t("privacy.rightsBody")}</p>
      </section>
      </section>
    </main>
  );
}
