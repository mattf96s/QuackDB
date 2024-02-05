import { createContext } from "react";
import type { DBState } from "./types";

export const DBStateContext = createContext<DBState | undefined>(undefined);
