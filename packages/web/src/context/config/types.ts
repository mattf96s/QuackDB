/**
 * Config / settings
 */
export type ConfigState = {
  browser: "chrome" | "safari" | "firefox" | "ie" | "unknown" | "node";
  isOnline: boolean;
};

export type ConfigMethods = {
  getBrowser: () => ConfigState["browser"];
  toggleIsOnline: (isOnline: boolean) => void;
};

export type ConfigContextValue = ConfigState & ConfigMethods;
