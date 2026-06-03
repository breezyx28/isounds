import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="is-page is-page--narrow">
      <section className="is-section">
      <h1 className="text-display-md font-semibold text-text">{t("about.title")}</h1>
      <p className="mt-4 text-body-lg text-text-muted">{t("about.intro")}</p>

      <section className="mt-10 space-y-4">
        <h2 className="text-heading-lg font-semibold text-text">{t("about.missionTitle")}</h2>
        <p className="text-body-md text-text-muted">{t("about.missionBody")}</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-heading-lg font-semibold text-text">{t("about.whatYouGetTitle")}</h2>
        <ul className="list-disc space-y-2 ps-5 text-body-md text-text-muted">
          <li>{t("about.points.discovery")}</li>
          <li>{t("about.points.personalized")}</li>
          <li>{t("about.points.subscription")}</li>
        </ul>
      </section>
      </section>
    </main>
  );
}
