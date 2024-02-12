import { createContext } from "react";
import type { QueryState } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const QueryContext = createContext<QueryState | undefined>(undefined);
