import { Link, useLocation } from "react-router-dom";
import {
  House,
  MagnifyingGlass,
  SquaresFour,
  Books,
  List,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/store/hooks";
import { setMobileDrawerOpen } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const tabs = [
    { to: "/browse", icon: House, label: t("nav.browse") },
    { to: "/explore", icon: MagnifyingGlass, label: t("nav.explore") },
    { to: "/categories", icon: SquaresFour, label: t("nav.categories") },
    { to: "/library", icon: Books, label: t("nav.library") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur-md md:hidden"
      aria-label={t("aria.mobileNav")}
    >
      <ul className="flex h-16 items-stretch justify-around">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active =
            location.pathname === to ||
            (to === "/categories" && location.pathname.startsWith("/categories"));
          return (
            <li key={to} className="flex flex-1">
              <Link
                to={to}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-label transition-colors",
                  active ? "text-primary" : "text-text-muted",
                )}
              >
                <Icon className="h-5 w-5" weight={active ? "fill" : "regular"} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button
            type="button"
            onClick={() => dispatch(setMobileDrawerOpen(true))}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-label text-text-muted"
          >
            <List className="h-5 w-5" />
            <span>{t("nav.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
