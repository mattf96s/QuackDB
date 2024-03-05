import { useLocalStorage } from "@uidotdev/usehooks";
import { useCallback, useMemo } from "react";
import { EditorSettingsContext } from "./context";

type EditorSettingsProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Context provider for monaco editor instance.
 *
 * Client side only.
 */
function EditorSettingsProvider(props: EditorSettingsProviderProps) {
  const [shouldFormat, setShouldFormat] = useLocalStorage("shouldFormat", true);

  /**
   * Potential settings to add in the future.
   */
  // const [darkTheme, setDarkTheme] = useLocalStorage("darkTheme", true);
  // const [lightTheme, setLightTheme] = useLocalStorage("lightTheme", false);
  // const [theme, setTheme] = useLocalStorage("theme", "dark");
  // const [fontSize, setFontSize] = useLocalStorage("fontSize", 14);
  // const [tabSize, setTabSize] = useLocalStorage("tabSize", 2);
  // const [wordWrap, setWordWrap] = useLocalStorage("wordWrap", "on");
  // const [lineNumbers, setLineNumbers] = useLocalStorage("lineNumbers", "on");
  // const [fontFamily, setFontFamily] = useLocalStorage("fontFamily", "Fira Code");
  // const [lineHeight, setLineHeight] = useLocalStorage("lineHeight", 1.5);
  // const [formatOnSave, setFormatOnSave] = useLocalStorage("formatOnSave", true);
  // const [formatOnPaste, setFormatOnPaste] = useLocalStorage("formatOnPaste", true);
  // const [formatOnType, setFormatOnType] = useLocalStorage("formatOnType", true);

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
