import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-[100dvh] bg-bg text-text">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:px-8 md:py-16 lg:grid-cols-12 lg:gap-12 xl:px-16 xl:py-20">
        <div className="lg:col-span-7 lg:pe-6">
          <p className="text-label tracking-[0.14em] text-primary">{t("landing.eyebrow")}</p>
          <h1 className="mt-4 max-w-[18ch] text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl">
            {t("landing.title")}
          </h1>
          <p className="mt-5 max-w-[62ch] text-body-lg leading-relaxed text-text-muted">
            {t("landing.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/home">{t("landing.ctaPrimary")}</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/subscribe">{t("landing.ctaSecondary")}</Link>
            </Button>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <article className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft md:p-7">
            <h2 className="text-heading-lg font-semibold tracking-tight text-text">
              {t("landing.cards.oneTitle")}
            </h2>
            <p className="mt-2 max-w-[42ch] text-body-md leading-relaxed text-text-muted">
              {t("landing.cards.oneBody")}
            </p>
            <div className="mt-6 h-1 w-14 rounded-full bg-primary/60" />
          </article>
        </aside>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 md:px-8 lg:grid-cols-12 xl:px-16 xl:pb-20">
        <article className="rounded-xl border border-border/80 bg-surface-raised p-6 lg:col-span-5">
          <h2 className="text-heading-lg font-semibold tracking-tight text-text">
            {t("landing.cards.twoTitle")}
          </h2>
          <p className="mt-2 max-w-[44ch] text-body-md leading-relaxed text-text-muted">
            {t("landing.cards.twoBody")}
          </p>
        </article>
        <article className="rounded-xl border border-border/80 bg-surface p-6 lg:col-span-7 lg:mt-6">
          <h2 className="text-heading-lg font-semibold tracking-tight text-text">
            {t("landing.cards.threeTitle")}
          </h2>
          <p className="mt-2 max-w-[52ch] text-body-md leading-relaxed text-text-muted">
            {t("landing.cards.threeBody")}
          </p>
          <div className="mt-5 border-t border-border/70 pt-4 text-label text-text-muted">
            {t("landing.ctaPrimary")}
          </div>
        </article>
      </section>
    </main>
  );
}
