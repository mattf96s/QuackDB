import React from "react";

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export const BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

// https://github.com/mfrkankaya/shadcn-themes/blob/main/hooks/use-breakpoint.ts
export default function useBreakpoint(
  breakpoint: Breakpoint,
  direction: "up" | "down" = "down",
) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(
      direction === "down"
        ? `(max-width: ${BREAKPOINTS[breakpoint]}px)`
        : `(min-width: ${BREAKPOINTS[breakpoint]}px)`,
    );
    setMatches(mediaQuery.matches);

    const handler = () => setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [breakpoint, direction]);

  return matches;
}
