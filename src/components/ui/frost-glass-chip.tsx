import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FrostGlassChipProps<T extends ElementType = "span"> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function FrostGlassChip<T extends ElementType = "span">({
  as,
  children,
  className,
  ...props
}: FrostGlassChipProps<T>) {
  const Comp = as ?? "span";

  return (
    <Comp className={cn("is-glass-chip", className)} {...props}>
      {children}
    </Comp>
  );
}
