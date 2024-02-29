import { useContext } from "react";
import { PaginationContext } from "./context";

/**
 * Hook to control the pagination state.
 */
export function usePagination() {
  const context = useContext(PaginationContext);

  if (context === undefined) {
    throw new Error("usePagination must be used within a PaginationProvider");
  }
  return context;
}
