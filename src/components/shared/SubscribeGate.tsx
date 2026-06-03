import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ZAIN_DSP } from "@/lib/constants";

interface SubscribeGateProps {
  className?: string;
}

export function SubscribeGate({ className }: SubscribeGateProps) {
  const { t } = useTranslation("player");

  return (
    <div
      className={`rounded-xl border border-border bg-surface-raised p-6 text-center md:p-8 ${className ?? ""}`}
    >
      <div className="mx-auto mb-4 h-20 max-w-md rounded-lg bg-surface-raised blur-[1px]" />
      <p className="mb-4 text-body-lg text-text-muted">{t("subscribeGateMessage")}</p>
      <Button asChild variant="zain">
        <a href={ZAIN_DSP} target="_blank" rel="noopener noreferrer">
          {t("subscribe")}
        </a>
      </Button>
    </div>
  );
}
