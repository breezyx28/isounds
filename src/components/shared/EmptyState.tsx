import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateCode = "empty" | "401" | "404" | "500" | "403";

type EmptyStateProps = {
  code?: EmptyStateCode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({
  code = "empty",
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-surface/40 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="relative flex flex-col items-center gap-2">
        <img
          src="/logos/isounds-icon-primary.svg"
          alt=""
          aria-hidden
          className="h-16 w-16 opacity-[0.22] blur-[0.3px] sm:h-20 sm:w-20"
        />
        {code !== "empty" && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted/80">
            {code}
          </span>
        )}
      </div>
      <div className="max-w-md space-y-2">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {description ? (
          <p className="text-sm leading-relaxed text-text-muted">{description}</p>
        ) : null}
      </div>
      {children}
      {actionLabel && actionTo ? (
        <Button asChild variant="secondary">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction && !actionTo ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
