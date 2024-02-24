import { createContext } from "react";
import type { ConfigContextValue } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const ConfigContext = createContext<ConfigContextValue | undefined>(
  undefined,
);
