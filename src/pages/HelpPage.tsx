import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const FAQ_ITEMS = ["subscription", "playback", "account"] as const;

export default function HelpPage() {
  const { t } = useTranslation();

  return (
    <main className="is-page is-page--narrow">
      <section className="is-section">
      <h1 className="text-display-md font-semibold text-text">{t("help.title")}</h1>
      <p className="mt-4 text-body-lg text-text-muted">{t("help.intro")}</p>

      <div className="mt-10 space-y-4">
        {FAQ_ITEMS.map((item) => (
          <article key={item} className="rounded-xl border border-border/70 bg-surface p-5">
            <h2 className="text-heading-md font-semibold text-text">
              {t(`help.faq.${item}.q`)}
            </h2>
            <p className="mt-2 text-body-md text-text-muted">{t(`help.faq.${item}.a`)}</p>
          </article>
        ))}
      </div>

      <p className="mt-8 text-body-md text-text-muted">
        {t("help.contactPrompt")}{" "}
        <Link to="/contact" className="text-primary hover:text-primary-bright">
          {t("nav.contact")}
        </Link>
      </p>
      </section>
    </main>
  );
}
