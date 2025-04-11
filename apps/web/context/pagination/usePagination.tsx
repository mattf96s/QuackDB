import { use } from "react";
import { PaginationContext } from "./context";

/**
 * Hook to control the pagination state.
 */
export function usePagination() {
  const context = use(PaginationContext);

  if (context === undefined) {
    throw new Error("usePagination must be used within a PaginationProvider");
  }
  return context;
}
