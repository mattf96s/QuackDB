import { createContext } from "react";
import type { ThemeProviderState } from "./types";

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

export const ThemeContext = createContext<ThemeProviderState>(initialState);
