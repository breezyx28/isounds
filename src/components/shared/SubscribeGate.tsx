import { Lock } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ZAIN_DSP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SubscribeGateProps {
  className?: string;
  /** Podcast cover shown blurred in overlay variant. */
  coverImage?: string;
  variant?: "card" | "overlay";
}

export function SubscribeGate({
  className,
  coverImage,
  variant = "card",
}: SubscribeGateProps) {
  const { t } = useTranslation("player");

  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "w-full overflow-hidden rounded-2xl border border-white/15 bg-black/55 shadow-2xl backdrop-blur-md",
          className,
        )}
      >
        {coverImage ? (
          <div className="relative h-40 w-full overflow-hidden md:h-48">
            <img
              src={coverImage}
              alt=""
              className="h-full w-full scale-110 object-cover blur-lg brightness-50"
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-sm">
                <Lock className="h-5 w-5" weight="fill" aria-hidden />
              </span>
            </div>
          </div>
        ) : null}

        <div className="p-6 text-center md:p-8">
          <p className="mb-5 text-body-lg leading-relaxed text-white">{t("subscribeGateMessage")}</p>
          <Button asChild variant="zain" size="lg">
            <a href={ZAIN_DSP} target="_blank" rel="noopener noreferrer">
              {t("subscribe")}
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-raised p-6 text-center md:p-8",
        className,
      )}
    >
      <p className="mb-4 text-body-lg text-text-muted">{t("subscribeGateMessage")}</p>
      <Button asChild variant="zain">
        <a href={ZAIN_DSP} target="_blank" rel="noopener noreferrer">
          {t("subscribe")}
        </a>
      </Button>
    </div>
  );
}
