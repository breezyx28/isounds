import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "iconsax-react";
import { getLogoPath } from "@/lib/theme";
import { useAppSelector } from "@/store/hooks";
import { LanguageToggle } from "./LanguageToggle";
import { GradientBorderButton } from "@/components/ui/buttons/gradient-border-button";
import { CancelSubscriptionModal } from "@/components/shared/CancelSubscriptionModal";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 20;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "whitespace-nowrap text-[13px] font-semibold transition-colors hover:text-primary-bright xl:text-body-md",
    isActive ? "text-primary" : "text-text",
  );

export function LandingNavbar() {
  const { t } = useTranslation();
  const auth = useAppSelector((s) => s.auth);
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {auth.status === "expired" && (
        <div className="relative z-10 border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-label text-warning">
          {t("auth.expiredBanner")}
        </div>
      )}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 border-b border-border/40 is-glass"
        initial={false}
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
        }
      />

      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-4 md:px-8 xl:px-16">
        <Link to="/" className="shrink-0">
          <img
            src={getLogoPath()}
            alt="iSounds"
            width={132}
            height={36}
            className="h-7 w-auto sm:h-8 md:h-9"
          />
        </Link>

        <nav
          className="hidden items-center gap-4 lg:flex xl:gap-6"
          aria-label={t("aria.mainNav")}
        >
          <NavLink to="/" end className={navLinkClass}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/browse" className={navLinkClass}>
            {t("nav.browse")}
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            {t("nav.categories")}
          </NavLink>
          <NavLink to="/explore" className={navLinkClass}>
            {t("nav.explore")}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {t("nav.about")}
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            {t("nav.contact")}
          </NavLink>
        </nav>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          <LanguageToggle className="hidden sm:flex" />
          {auth.status === "checking" && (
            <span className="hidden rounded-md border border-border px-3 py-1 text-label text-text-muted md:inline-flex">
              {t("auth.checking")}
            </span>
          )}
          {auth.status !== "subscribed" ? (
            <>
              <GradientBorderButton className="group relative px-3 py-2 text-[10px] font-extrabold uppercase leading-none tracking-wide sm:px-4 sm:text-[12px]">
                <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                  {t("nav.subscribe")}
                  <ArrowRight
                    size={15}
                    color="purple"
                    variant="Bold"
                    className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </GradientBorderButton>
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
