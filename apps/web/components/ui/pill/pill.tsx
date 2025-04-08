import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";
import { pillVariants } from "./variants";

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {
  asChild?: boolean;
}

/**
 * Custom pill component.
 *
 * Styling based on [Pines](https://devdojo.com/pines/docs/badge).
 */
const Pill = React.forwardRef<HTMLSpanElement, PillProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        className={cn(pillVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Pill.displayName = "Pill";

export { Pill };
