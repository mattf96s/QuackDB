import {
  Link,
  type LinkProps as TanstackLinkProps,
} from "@tanstack/react-router";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

export type LinkProps = TanstackLinkProps & VariantProps<typeof buttonVariants>;

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
