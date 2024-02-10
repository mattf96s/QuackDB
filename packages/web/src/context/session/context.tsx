import { createContext } from "react";
import type { SessionState } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const SessionContext = createContext<SessionState | undefined>(
  undefined,
);
