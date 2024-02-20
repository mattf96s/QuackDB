import { createContext } from "react";
import type { DBState } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const DBContext = createContext<DBState | undefined>(undefined);
