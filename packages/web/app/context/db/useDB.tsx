import { useContext } from "react";
import { DBContext } from "./context";

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Hook to access the DuckDB instance
 */
export function useDB() {
  const context = useContext(DBContext);
  if (context === undefined) {
    throw new Error("useDB must be used within a DBContext");
  }
  return context;
}
