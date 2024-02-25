import { useLocalStorage } from "@uidotdev/usehooks";
import { useCallback, useMemo } from "react";
import { EditorSettingsContext } from "./context";

type EditorSettingsProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Context provider for monaco editor instance.
 */
function EditorSettingsProvider(props: EditorSettingsProviderProps) {
  const [shouldFormat, setShouldFormat] = useLocalStorage("shouldFormat", true);

  const toggleShouldFormat = useCallback(
    (shouldFormat: boolean) => setShouldFormat(shouldFormat),
    [setShouldFormat],
  );

  const value = useMemo(
    () => ({
      shouldFormat,
      toggleShouldFormat,
    }),
    [shouldFormat, toggleShouldFormat],
  );
  return (
    <EditorSettingsContext.Provider value={value}>
      {props.children}
    </EditorSettingsContext.Provider>
  );
}

export { EditorSettingsProvider };
