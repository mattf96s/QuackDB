export type Browser =
  | "chrome"
  | "safari"
  | "firefox"
  | "ie"
  | "unknown"
  | "node";
/**
 * Find the browser name.
 */
export const getBrowser = (): Browser => {
  if (typeof window === "undefined") {
    return "node";
  }
  const userAgent = window.navigator.userAgent;

  const browsers: Record<
    Extract<Browser, "chrome" | "safari" | "firefox" | "ie">,
    RegExp
  > = {
    chrome: /chrome/i,
    safari: /safari/i,
    firefox: /firefox/i,
    ie: /internet explorer/i,
  } as const;

  for (const key in browsers) {
    if (browsers[key as keyof typeof browsers].test(userAgent)) {
      return key as Browser;
    }
  }

  return "unknown";
};
