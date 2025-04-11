import { use } from "react";
import { SessionContext } from "./context";

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Hook to get the session context.
 *
 * Includes session information and accompanying file handles.
 */
export function useSession() {
  const context = use(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionContext");
  }
  return context;
}
