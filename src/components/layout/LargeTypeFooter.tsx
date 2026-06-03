import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FacebookLogo, InstagramLogo, TiktokLogo } from "@phosphor-icons/react";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com", icon: FacebookLogo, labelKey: "footer.social.facebook" },
  { href: "https://www.instagram.com", icon: InstagramLogo, labelKey: "footer.social.instagram" },
  { href: "https://www.tiktok.com", icon: TiktokLogo, labelKey: "footer.social.tiktok" },
] as const;

export function LargeTypeFooter({ className }: { className?: string }) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const navigationLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/browse", label: t("nav.browse") },
    { to: "/explore", label: t("nav.explore") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
    { to: "/help", label: t("nav.help") },
  ];

  const discoverLinks = [
    { to: "/categories", label: t("nav.categories") },
    { to: "/subscribe", label: t("nav.subscribe") },
    { to: "/library", label: t("nav.library") },
    { to: "/terms", label: t("nav.terms") },
    { to: "/privacy", label: t("nav.privacy") },
  ];

  return (
    <footer
      className={cn(
        "relative mt-auto overflow-hidden rounded-t-[3rem] bg-surface text-text md:rounded-t-[4rem]",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-12 md:px-8 md:pt-16 xl:px-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold tracking-tight text-text">
              {t("footer.brandTitle")}
            </h2>
            <p className="max-w-xs text-body-md leading-relaxed text-text-muted">
              {t("footer.brandBody")}
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ href, icon: Icon, labelKey }) => (
                <a
                  key={labelKey}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-raised text-primary-deep transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  aria-label={t(labelKey)}
                >
                  <Icon className="h-5 w-5" weight="fill" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-5 text-lg font-bold tracking-tight text-text">
              {t("footer.navigationTitle")}
            </h2>
            <ul className="flex flex-col gap-3">
              {navigationLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-body-md text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-5 text-lg font-bold tracking-tight text-text">
              {t("footer.discoverTitle")}
            </h2>
            <ul className="flex flex-col gap-3">
              {discoverLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-body-md text-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-bold tracking-tight text-text">
              {t("footer.joinTitle")}
            </h2>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("footer.emailPlaceholder")}
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-body-md text-text outline-none transition-colors placeholder:text-text-disabled focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </form>
            <p className="text-body-md leading-relaxed text-text-muted">
              {t("footer.joinBody")}
            </p>
            <LanguageToggle />
          </div>
        </div>

        <div className="mt-10 md:mt-14 lg:mt-16">
          <div className="flex items-end gap-3 overflow-hidden md:gap-5">
            <img
              src="/logos/isounds-icon-black.png"
              alt=""
              aria-hidden
              className="h-[clamp(3.5rem,14vw,10rem)] w-auto shrink-0"
            />
            <span
              className="font-nunito text-[clamp(3.25rem,16vw,12.5rem)] font-black uppercase leading-[0.88] tracking-tight text-primary-deep"
              aria-hidden
            >
              ISOUNDS
            </span>
          </div>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center md:mt-10">
          <p className="text-label text-text-muted">
            {t("footer.copyright", { year })}
          </p>
          <p className="mt-1 text-label text-text-disabled">{t("footer.tagline")}</p>
          <p className="mt-3 text-label font-medium text-primary">{t("footer.zainNote")}</p>
        </div>
      </div>
    </footer>
  );
}
