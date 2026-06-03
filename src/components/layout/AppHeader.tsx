import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { getLogoPath } from "@/lib/theme";
import { ZAIN_DSP } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";
import { CancelSubscriptionModal } from "@/components/shared/CancelSubscriptionModal";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "text-body-md transition-colors hover:text-primary-bright",
    isActive ? "text-primary" : "text-text-muted",
  );

export function AppHeader() {
  const { t } = useTranslation();
  const auth = useAppSelector((s) => s.auth);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      {auth.status === "expired" && (
        <div className="border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-label text-warning">
          {t("auth.expiredBanner")}
        </div>
      )}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8 xl:px-16">
        <Link to="/home" className="shrink-0">
          <img
            src={getLogoPath()}
            alt="iSounds"
            width={132}
            height={36}
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label={t("aria.mainNav")}>
          <NavLink to="/home" className={navLinkClass}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            {t("nav.categories")}
          </NavLink>
          <NavLink to="/explore" className={navLinkClass}>
            {t("nav.explore")}
          </NavLink>
          {auth.status === "subscribed" && (
            <>
              <NavLink to="/library" className={navLinkClass}>
                {t("nav.library", { defaultValue: "Library" })}
              </NavLink>
              <NavLink to="/library/saved" className={navLinkClass}>
                {t("nav.saved", { defaultValue: "Saved" })}
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageToggle className="hidden sm:flex" />
          {auth.status === "checking" && (
            <span className="hidden rounded-md border border-border px-3 py-1 text-label text-text-muted md:inline-flex">
              {t("auth.checking")}
            </span>
          )}
          {auth.status !== "subscribed" ? (
            <>
              <Button variant="secondary" size="sm" className="hidden md:inline-flex" asChild>
                <Link to="/login">{t("auth.login")}</Link>
              </Button>
              <Button
                variant="zain"
                size="sm"
                className="hidden md:inline-flex"
                asChild
              >
                <a href={ZAIN_DSP} target="_blank" rel="noopener noreferrer">
                  {t("nav.subscribe")}
                </a>
              </Button>
            </>
          ) : (
            <>
              <span className="hidden rounded-md border border-success/40 bg-success/10 px-3 py-1 text-label text-success md:inline-flex">
                {t("auth.subscribedBadge")}
              </span>
              <CancelSubscriptionModal />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
