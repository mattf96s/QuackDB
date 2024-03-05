import { createContext } from "react";
import type { WrapperState } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const WrapperContext = createContext<WrapperState | undefined>(
  undefined,
);
