import { useContext } from "react";
import { EditorSettingsContext } from "./context";

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Hook to access editor settings.
 */
export function useEditorSettings() {
  const context = useContext(EditorSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useEditorSettings must be used within an EditorSettingsProvider",
    );
  }
  return context;
}
