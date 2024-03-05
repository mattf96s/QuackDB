import { useCallback, useEffect, useMemo, useRef } from "react";
import { type Remote, wrap } from "comlink";
import type { editor } from "monaco-editor";
import { toast } from "sonner";
import { useSession } from "@/context/session/useSession";
import type { SaveSessionWorker } from "@/workers/save-state-worker";

export const useEditorSession = () => {
  const workerRef = useRef<Worker | null>(null);
  const wrapperRef = useRef<Remote<SaveSessionWorker> | null>(null);

  const { session } = useSession();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const w = new Worker(
      new URL("@/workers/save-state-worker.ts", import.meta.url),
      {
        name: "save-state-worker",
        type: "module",
      },
    );
    workerRef.current = w;

    const fn: Remote<SaveSessionWorker> = wrap<SaveSessionWorker>(w);

    wrapperRef.current = fn;

    signal.addEventListener("abort", () => {
      fn[releaseProxy]();
      w.terminate();

      workerRef.current = null;
      wrapperRef.current = null;
    });

    return () => {
      controller.abort();
    };
  }, []);

  const onSave = useCallback(
    async (sessionState: editor.ICodeEditorViewState) => {
      const fn = wrapperRef.current;

      if (!fn) return;

      try {
        await fn({
          session,
          sessionState: JSON.stringify(sessionState),
        });

        toast.success("Session state saved");
      } catch (e) {
        console.error("Error saving session state", e);
        toast.error("Error saving session state", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    },
    [session],
  );

  const onRestore = useCallback(async () => {
    try {
      const root = await navigator.storage.getDirectory();
      const sessionDirectory = await root.getDirectoryHandle(session, {
        create: false,
      });

      const file = await sessionDirectory.getFileHandle("editor-state.json", {
        create: false,
      });

      const fileHandle = await file.getFile();

      const contents = await fileHandle.text();

      return JSON.parse(contents);
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotFoundError") {
        toast.error("No session state found");
        return;
      }
      console.error("Error restoring session state", e);
      toast.error("Error restoring session state", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [session]);

  return useMemo(
    () => ({
      onSave,
      onRestore,
    }),
    [onRestore, onSave],
  );
};
