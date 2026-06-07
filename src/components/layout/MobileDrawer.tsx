import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useGetCategoriesQuery } from "@/store/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMobileDrawerOpen } from "@/store/slices/uiSlice";
import { LanguageToggle } from "./LanguageToggle";
import { ZAIN_DSP } from "@/lib/constants";
import { CancelSubscriptionModal } from "@/components/shared/CancelSubscriptionModal";

export function MobileDrawer() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.mobileDrawerOpen);
  const auth = useAppSelector((s) => s.auth);
  const { data: categories = [] } = useGetCategoriesQuery(undefined, {
    skip: !open,
  });

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => dispatch(setMobileDrawerOpen(v))}
    >
      <SheetContent side="left" className="px-4 pb-8 pt-2">
        <div className="flex items-center justify-between py-4">
          <span className="text-heading-md font-semibold">{t("nav.more")}</span>
        </div>
        <LanguageToggle className="mb-4 w-full justify-center" />
        <Separator className="my-4" />
        <p className="mb-2 text-label uppercase tracking-wide text-text-muted">
          {t("nav.categories")}
        </p>
        <ul className="max-h-48 space-y-1 overflow-y-auto">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/categories/${cat.id}`}
                className="block rounded-md px-2 py-2 text-body-md hover:bg-surface-raised"
                onClick={() => dispatch(setMobileDrawerOpen(false))}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <nav className="flex flex-col gap-2">
          <Link
            to="/explore"
            className="min-h-11 rounded-md px-2 py-2.5 text-body-md hover:bg-surface-raised"
            onClick={() => dispatch(setMobileDrawerOpen(false))}
          >
            {t("nav.explore")}
          </Link>
          {auth.status === "subscribed" && (
            <>
              <Link
                to="/library"
                className="min-h-11 rounded-md px-2 py-2.5 text-body-md hover:bg-surface-raised"
                onClick={() => dispatch(setMobileDrawerOpen(false))}
              >
                {t("nav.library", { defaultValue: "Library" })}
              </Link>
              <Link
                to="/library/personalization"
                className="min-h-11 rounded-md px-2 py-2.5 text-body-md hover:bg-surface-raised"
                onClick={() => dispatch(setMobileDrawerOpen(false))}
              >
                {t("nav.personalization", { defaultValue: "For you" })}
              </Link>
              <Link
                to="/library/saved"
                className="min-h-11 rounded-md px-2 py-2.5 text-body-md hover:bg-surface-raised"
                onClick={() => dispatch(setMobileDrawerOpen(false))}
              >
                {t("nav.saved", { defaultValue: "Saved" })}
              </Link>
            </>
          )}
          {auth.status !== "subscribed" ? (
            <>
              <Link
                to="/login"
                className="rounded-md px-2 py-2 text-body-md hover:bg-surface-raised"
                onClick={() => dispatch(setMobileDrawerOpen(false))}
              >
                {t("auth.login")}
              </Link>
              <a
                href={ZAIN_DSP}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-zain px-3 py-2 text-center text-body-md text-white"
              >
                {t("nav.subscribe")}
              </a>
            </>
          ) : (
            <>
              <span className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-body-md text-success">
                {t("auth.subscribedBadge")}
              </span>
              <CancelSubscriptionModal />
            </>
          )}
          <Link
            to="/about"
            className="rounded-md px-2 py-2 text-body-md hover:bg-surface-raised"
            onClick={() => dispatch(setMobileDrawerOpen(false))}
          >
            {t("nav.about")}
          </Link>
          <Link
            to="/help"
            className="rounded-md px-2 py-2 text-body-md hover:bg-surface-raised"
            onClick={() => dispatch(setMobileDrawerOpen(false))}
          >
            {t("nav.help")}
          </Link>
          <Link
            to="/terms"
            className="rounded-md px-2 py-2 text-body-md hover:bg-surface-raised"
            onClick={() => dispatch(setMobileDrawerOpen(false))}
          >
            {t("nav.terms")}
          </Link>
          <Link
            to="/privacy"
            className="rounded-md px-2 py-2 text-body-md hover:bg-surface-raised"
            onClick={() => dispatch(setMobileDrawerOpen(false))}
          >
            {t("nav.privacy")}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
