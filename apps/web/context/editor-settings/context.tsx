"use client";
import { createContext } from "react";
import type { EditorSettingsContextValue } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const EditorSettingsContext = createContext<
  EditorSettingsContextValue | undefined
>(undefined);
