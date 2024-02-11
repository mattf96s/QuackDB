import { useCallback, useMemo, useState } from "react";
import type { editor } from "monaco-editor";
import { toast } from "sonner";
import { SessionContext } from "./context";

type SessionProviderProps = {
  children: React.ReactNode;
};

function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState("default");

  const onSessionChange = useCallback((session: string) => {
    setSession(session);
  }, []);

  const value = useMemo(
    () => ({
      session,
      onSessionChange,
    }),
    [onSessionChange, session],
  );

  const onSaveState = useCallback(
    async (sessionState: editor.ICodeEditorViewState) => {
      try {
        const root = await navigator.storage.getDirectory();
        const session = await root.getDirectoryHandle("session", {
          create: true,
        });

        const file = await session.getFileHandle("editor-state.json", {
          create: true,
        });

        const writable = await file.createWritable();
        await writable.write(JSON.stringify(sessionState));

        await writable.close();
      } catch (e) {
        console.error("Error saving session state", e);
        toast.error("Error saving session state", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    },
    [],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export { SessionProvider };
