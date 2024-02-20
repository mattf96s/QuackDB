import { memo, useEffect, useState } from "react";
import { CACHE_KEYS } from "@/constants";
import { ThemeContext } from "./context";
import type { Theme } from "./types";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

const storageKey = CACHE_KEYS.THEME;

const ThemeProvider = memo(function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeContext.Provider
      {...props}
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
});

export { ThemeProvider };
