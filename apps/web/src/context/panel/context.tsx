import { createContext } from "react";
import type { PanelState } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const PanelContext = createContext<PanelState | undefined>(undefined);
