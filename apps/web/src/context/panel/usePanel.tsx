import { useContext } from "react";
import { PanelContext } from "./context";

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Hook to get the session context.
 */
export function usePanel() {
  const context = useContext(PanelContext);
  if (context === undefined) {
    throw new Error("usePanel must be used within a PanelProvider");
  }
  return context;
}
