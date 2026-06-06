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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-safe backdrop-blur-md lg:hidden"
      aria-label={t("aria.mobileNav")}
    >
      <ul className="mx-auto flex h-14 max-w-3xl items-stretch justify-around sm:h-16">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active =
            location.pathname === to ||
            (to === "/categories" && location.pathname.startsWith("/categories"));
          return (
            <li key={to} className="flex flex-1">
              <Link
                to={to}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] font-semibold leading-none transition-colors min-[380px]:text-[10px] sm:text-[11px]",
                  active ? "text-primary" : "text-text-muted",
                )}
              >
                <Icon className="h-[21px] w-[21px] sm:h-6 sm:w-6" weight={active ? "fill" : "bold"} />
                <span className="block max-w-full truncate">{label}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button
            type="button"
            onClick={() => dispatch(setMobileDrawerOpen(true))}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[9px] font-semibold leading-none text-text-muted min-[380px]:text-[10px] sm:text-[11px]"
          >
            <List className="h-[21px] w-[21px] sm:h-6 sm:w-6" weight="bold" />
            <span className="block max-w-full truncate">{t("nav.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
