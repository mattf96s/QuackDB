import { Link, type LinkProps as RemixLinkProps } from "@remix-run/react";
import { type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "~/lib/utils";
import { buttonVariants } from "../button";

export type LinkProps = RemixLinkProps & VariantProps<typeof buttonVariants>;

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

export { StyledLink };
