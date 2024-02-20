import { createContext } from "react";
import type { EditorState } from "./types";

// Breakup everything into smaller files because of React Fast Refresh limitations.
export const EditorContext = createContext<EditorState | undefined>(undefined);
