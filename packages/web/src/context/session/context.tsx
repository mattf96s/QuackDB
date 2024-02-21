import { createContext } from "react";
import type { SessionContextValue } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);
