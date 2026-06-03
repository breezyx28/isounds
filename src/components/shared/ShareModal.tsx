import { useCallback, useMemo, useState } from "react";
import {
  Check,
  Copy,
  FacebookLogo,
  Link as LinkIcon,
  ShareNetwork,
  TelegramLogo,
  WhatsappLogo,
  XLogo,
} from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareModalProps {
  title: string;
  url: string;
  triggerVariant?: "default" | "icon";
  className?: string;
}

const NETWORK_ICONS = {
  facebook: FacebookLogo,
  x: XLogo,
  telegram: TelegramLogo,
  whatsapp: WhatsappLogo,
} as const;

export function ShareLinkBar({ url, className }: { url: string; className?: string }) {
  const { t } = useTranslation("player");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t("linkCopied"));
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error(t("copyFailed"));
    }
  }, [t, url]);

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-label font-semibold uppercase tracking-widest text-text-muted">
        {t("shareLink")}
      </p>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-soft">
        <LinkIcon className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
        <span className="min-w-0 flex-1 truncate font-mono text-label text-text-muted">
          {url}
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 rounded-lg"
          onClick={() => void handleCopy()}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t("copied") : t("copyLink")}
        </Button>
      </div>
    </div>
  );
}

export function ShareModal({
  title,
  url,
  triggerVariant = "default",
  className,
}: ShareModalProps) {
  const { t } = useTranslation("player");
  const [open, setOpen] = useState(false);

  const targets = useMemo(
    () =>
      [
        {
          key: "facebook" as const,
          href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        },
        {
          key: "x" as const,
          href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
        {
          key: "telegram" as const,
          href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        },
        {
          key: "whatsapp" as const,
          href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
        },
      ] as const,
    [title, url],
  );

  const handleShareClick = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User dismissed or share failed — fall through to dialog.
      }
    }
    setOpen(true);
  }, [title, url]);

  return (
    <>
      {triggerVariant === "icon" ? (
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-full border border-border bg-surface p-0 text-text-muted shadow-soft hover:bg-surface-raised active:scale-95",
            className,
          )}
          aria-label={t("share")}
          onClick={(event) => {
            event.stopPropagation();
            void handleShareClick();
          }}
        >
          <ShareNetwork className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          className={cn("rounded-xl", className)}
          onClick={() => void handleShareClick()}
        >
          <ShareNetwork />
          {t("share")}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shareTitle")}</DialogTitle>
          </DialogHeader>
          <ShareLinkBar url={url} />
          <div className="grid grid-cols-2 gap-2 pt-2">
            {targets.map((target) => {
              const Icon = NETWORK_ICONS[target.key];
              return (
                <Button key={target.key} variant="secondary" asChild className="justify-start gap-2">
                  <a href={target.href} target="_blank" rel="noopener noreferrer">
                    <Icon className="h-4 w-4" weight="fill" />
                    {t(`networks.${target.key}`)}
                  </a>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
