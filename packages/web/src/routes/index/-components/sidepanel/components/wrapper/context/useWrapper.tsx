import { useContext } from "react";
import { WrapperContext } from "./context";

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Hook to manage opening and closing panels.
 */
export function useWrapper() {
  const context = useContext(WrapperContext);
  if (context === undefined) {
    throw new Error("useWrapper must be used within a WrapperContext");
  }
  return context;
}
