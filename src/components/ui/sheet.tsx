import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/utils";

const Sheet = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);

const SheetTrigger = DrawerPrimitive.Trigger;
const SheetClose = DrawerPrimitive.Close;
const SheetPortal = DrawerPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-black/60", className)}
    {...props}
  />
));
SheetOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    side?: "bottom" | "left" | "right";
  }
>(({ className, children, side = "bottom", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col border border-border bg-surface",
        side === "bottom" &&
          "inset-x-0 bottom-0 mt-24 max-h-[85vh] rounded-t-xl",
        side === "left" && "inset-y-0 start-0 h-full w-80 rounded-e-xl",
        side === "right" && "inset-y-0 end-0 h-full w-80 rounded-s-xl",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-border" />
      {children}
    </DrawerPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetPortal };
