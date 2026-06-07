import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { applyDocumentLanguage } from "@/i18n";
import {
  getLanguageFlagLabel,
  LanguageFlagIcon,
} from "@/components/icons/LanguageFlags";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useSavePreferenceMutation } from "@/store/localApi";
import { setLanguage, type Language } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const language = useAppSelector((s) => s.ui.language);
  const authStatus = useAppSelector((s) => s.auth.status);
  const [savePreference] = useSavePreferenceMutation();
  const prefersReducedMotion = useReducedMotion();

  const toggle = () => {
    const next: Language = language === "ar" ? "en" : "ar";
    dispatch(setLanguage(next));
    void applyDocumentLanguage(next).then(() => {
      if (authStatus === "subscribed") {
        void savePreference({ key: "lang", value: next });
      }
    });
  };

  const otherLanguage = language === "ar" ? "en" : "ar";
  const slideDirection = language === "en" ? 1 : -1;

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-raised",
        "transition-colors hover:border-primary/30 hover:bg-surface",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "active:scale-[0.98]",
        className,
      )}
      aria-label={`${t("aria.languageToggle")}: ${getLanguageFlagLabel(language)}. ${getLanguageFlagLabel(otherLanguage)}`}
      title={getLanguageFlagLabel(language)}
    >
      <span className="relative flex h-[14px] w-[21px] items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
          <motion.span
            key={language}
            custom={slideDirection}
            className="absolute inset-0 flex items-center justify-center"
            variants={{
              enter: (dir: number) => ({
                x: dir * 12,
                opacity: 0,
              }),
              center: {
                x: 0,
                opacity: 1,
              },
              exit: (dir: number) => ({
                x: dir * -12,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <LanguageFlagIcon language={language} />
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
