import { createContext } from "react";
import type { ChartState } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const ChartContext = createContext<ChartState | undefined>(undefined);
