import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRecordPwaEventMutation } from "@/store/localApi";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "pwa_install_dismissed_until";
const VISIT_KEY = "pwa_install_visit_count";

export function PwaInstallBanner() {
  const { t } = useTranslation();
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [recordPwaEvent] = useRecordPwaEventMutation();

  const isStandalone = useMemo(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari standalone flag
      window.navigator.standalone === true,
    [],
  );

  useEffect(() => {
    if (isStandalone) return;

    const visits = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
    localStorage.setItem(VISIT_KEY, String(visits));

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
      if (Date.now() < dismissedUntil) return;

      if (visits >= 2) {
        setVisible(true);
        void recordPwaEvent({ event: "prompt_shown" });
        return;
      }

      const timer = window.setTimeout(() => {
        setVisible(true);
        void recordPwaEvent({ event: "prompt_shown" });
      }, 30_000);
      return () => window.clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [isStandalone, recordPwaEvent]);

  if (!visible || !deferredPrompt) return null;
  if (location.pathname === "/subscribe" || location.pathname === "/login") return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto w-full max-w-md rounded-lg border border-border bg-surface p-4 shadow-elevation md:bottom-6">
      <p className="text-heading-sm font-semibold text-text">
        {t("pwa.installTitle")}
      </p>
      <p className="mt-1 text-body-md text-text-muted">
        {t("pwa.installBody")}
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={async () => {
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            setVisible(false);
            if (choice.outcome === "accepted") {
              void recordPwaEvent({ event: "accepted" });
            } else {
              localStorage.setItem(
                DISMISS_KEY,
                String(Date.now() + 7 * 24 * 60 * 60 * 1000),
              );
              void recordPwaEvent({ event: "dismissed" });
            }
          }}
        >
          {t("pwa.installAction")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            localStorage.setItem(
              DISMISS_KEY,
              String(Date.now() + 7 * 24 * 60 * 60 * 1000),
            );
            setVisible(false);
            void recordPwaEvent({ event: "dismissed" });
          }}
        >
          {t("pwa.dismissAction")}
        </Button>
      </div>
    </div>
  );
}
