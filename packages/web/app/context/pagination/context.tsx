import { createContext } from "react";
import type { PaginationContextValue } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const PaginationContext = createContext<
  PaginationContextValue | undefined
>(undefined);
