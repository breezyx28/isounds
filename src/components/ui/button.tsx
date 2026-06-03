import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleNotch } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-body-md font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:-translate-y-px hover:bg-primary-bright",
        secondary:
          "border border-border bg-surface-raised text-text hover:-translate-y-px hover:bg-surface",
        ghost: "text-primary hover:-translate-y-px hover:bg-primary/10",
        danger: "border border-error/30 bg-error/10 text-error",
        zain: "bg-zain text-white hover:-translate-y-px hover:opacity-90",
        toggle:
          "border border-border bg-surface text-text-muted hover:-translate-y-px hover:bg-surface-raised data-[state=on]:border-primary data-[state=on]:bg-primary/15 data-[state=on]:text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-label",
        lg: "h-12 px-6 text-body-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <CircleNotch className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
