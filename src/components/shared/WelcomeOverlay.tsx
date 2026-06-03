import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface WelcomeOverlayProps {
  open: boolean;
  onDismiss?: () => void;
}

export function WelcomeOverlay({ open, onDismiss }: WelcomeOverlayProps) {
  const { t } = useTranslation("common");
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-bg/90 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-border bg-surface p-8 text-center"
          >
            <img
              src="/logo.png"
              alt="iSounds"
              width={148}
              height={56}
              className="mx-auto mb-4 h-14 w-auto"
            />
            <p className="text-heading-lg font-semibold text-text">{t("auth.welcomeTitle")}</p>
            <p className="mt-2 text-body-md text-text-muted">{t("auth.welcomeBody")}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
