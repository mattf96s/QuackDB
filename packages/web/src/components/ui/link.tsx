import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { buttonVariants } from "./button";
import { Link } from "@tanstack/react-router";
import type { LinkProps as TanstackLinkProps } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export interface LinkProps
  extends TanstackLinkProps,
    VariantProps<typeof buttonVariants> {}

const StyledLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <Link
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
StyledLink.displayName = "Link";

export { StyledLink, buttonVariants as linkVariants };
