import { createContext } from "react";
import type { QueryContextValue } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const QueryContext = createContext<QueryContextValue | undefined>(
  undefined,
);
