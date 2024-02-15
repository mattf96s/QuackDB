import { useEffect, useMemo, useRef } from "react";
import type { EditorForwardedRef } from "@/components/monaco";
import { EditorContext } from "./context";

type EditorProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Context provider for monaco editor instance.
 */
function EditorProvider(props: EditorProviderProps) {
  const editorRef = useRef<EditorForwardedRef | null>(null);

  // cleanup
  useEffect(() => {
    return () => {
      editorRef.current?.getEditor()?.dispose();
    };
  }, []);

  const value = useMemo(
    () => ({
      editorRef,
    }),
    [],
  );
  return (
    <EditorContext.Provider value={value}>
      {props.children}
    </EditorContext.Provider>
  );
}

export { EditorProvider };
