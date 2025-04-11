import { use } from "react";
import { QueryContext } from "./context";

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Hook to access the query context.
 */
export function useQuery() {
  const context = use(QueryContext);
  if (context === undefined) {
    throw new Error("useQuery must be used within a QueryProvider");
  }
  return context;
}
