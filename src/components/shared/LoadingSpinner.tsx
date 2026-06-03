import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  className?: string;
  label?: string;
  fullScreen?: boolean;
};

export function LoadingSpinner({
  className,
  label = "Loading",
  fullScreen = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen ? "min-h-[50vh] w-full py-16" : "py-12",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="inline-block h-10 w-10 animate-spin rounded-full border-[3px] border-primary/25 border-t-primary"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
