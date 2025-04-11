import { use } from "react";
import { EditorContext } from "./context";

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Hook to access the query context.
 */
export function useEditor() {
  const context = use(EditorContext);
  if (context === undefined) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
