import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { releaseProxy, type Remote, wrap } from "comlink";
import { toast } from "sonner";
import type { FileEntry } from "@/constants";
import { SessionContext } from "./context";
import type { Action, SaveEditorProps, SessionState } from "./types";
import type { SessionWorker } from "./worker";

// Split up the context files to appease react-refresh.

type SessionProviderProps = {
  children: React.ReactNode;
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "SET_STATUS": {
      const { status } = action.payload;
      return {
        ...state,
        status,
      };
    }
    case "ADD_EDITOR": {
      return {
        ...state,
        editors: [...state.editors, action.payload],
      };
    }
    case "DELETE_EDITOR": {
      return {
        ...state,
        editors: state.editors.filter(
          (editor) => editor.path !== action.payload.path,
        ),
      };
    }
    case "UPDATE_EDITOR": {
      const { path, content } = action.payload;
      const index = state.editors.findIndex((editor) => editor.path === path);
      if (index === -1) return { ...state };
      const editor = state.editors[index];
      if (!editor) return { ...state };
      return {
        ...state,
        editors: [
          ...state.editors.slice(0, index),
          {
            ...editor,
            content,
            isDirty: true,
            isSaved: false,
          },
          ...state.editors.slice(index + 1),
        ],
      };
    }
    case "ADD_SOURCES": {
      return {
        ...state,
        sources: [...state.sources, ...action.payload],
      };
    }

    case "REMOVE_SOURCE": {
      const { path } = action.payload;

      return {
        ...state,
        sources: state.sources.filter((source) => source.path !== path),
      };
    }
    // close the editor view (not delete the editor from the state)
    case "CLOSE_EDITOR": {
      const { path } = action.payload;
      const index = state.editors.findIndex((editor) => editor.path === path);
      // not found
      if (index === -1) return { ...state };
      const editor = state.editors[index];
      if (!editor) return { ...state };

      // #TODO: focus the next editor

      return {
        ...state,
        editors: [
          ...state.editors.slice(0, index),
          {
            ...editor,
            isOpen: false,
            isFocused: false,
          },
          ...state.editors.slice(index + 1),
        ],
      };
    }
    case "OPEN_EDITOR": {
      const { path } = action.payload;
      const index = state.editors.findIndex(
        (editor) => editor.handle.name === path,
      );
      // not found
      if (index === -1) return { ...state };

      const editor = state.editors[index];

      if (!editor) return { ...state };

      return {
        ...state,
        editors: [
          ...state.editors.slice(0, index),
          {
            ...editor,
            isOpen: true,
          },
          ...state.editors.slice(index + 1),
        ],
      };
    }
    case "SAVE_EDITOR": {
      const { path, content, handle } = action.payload;
      const index = state.editors.findIndex((editor) => editor.path === path);
      if (index === -1) return { ...state };
      const editor = state.editors[index];
      if (!editor) return { ...state };
      return {
        ...state,
        editors: [
          ...state.editors.slice(0, index),
          {
            ...editor,
            content,
            isFocused: true,
            isDirty: false,
            isSaved: true,
            isNew: false, // if it was new, it's not new anymore (so we don't delete it when we close it).
            handle,
          },
          ...state.editors.slice(index + 1),
        ],
      };
    }
    case "FOCUS_EDITOR": {
      const { path } = action.payload;
      return {
        ...state,
        editors: state.editors.map((editor) => ({
          ...editor,
          isOpen: editor.path === path || editor.isOpen, // open the editor if it's not open
          isFocused: editor.path === path,
        })),
      };
    }
    // reset the editor state
    case "OPEN_SESSION": {
      const { sessionId, directoryHandle, editors, sources } = action.payload;
      return {
        ...state,
        directoryHandle,
        editors,
        sources,
        status: "ready",
        sessionId,
      };
    }

    case "REFRESH_EDITOR": {
      const { path, handle } = action.payload;

      const index = state.editors.findIndex((editor) => editor.path === path);

      if (index === -1) return { ...state };

      const editor = state.editors[index];

      if (!editor) return { ...state };

      return {
        ...state,
        editors: [
          ...state.editors.slice(0, index),
          {
            ...editor,
            isFocused: true,
            isDirty: false,
            isSaved: true,
            handle,
          },
          ...state.editors.slice(index + 1),
        ],
      };
    }
    default: {
      console.warn(`Unhandled file action type: ${action}`);
      return { ...state };
    }
  }
}

const initialFileState: SessionState = {
  status: "initializing_worker",
  sessionId: "quackdb", // 'quackdb' is the default session name.
  onSessionChange: () => {},
  // editor stuff
  directoryHandle: null,
  editors: [],
  sources: [],
  dispatch: null,
  onAddSources: async () => {},
  onAddEditor: async () => {},
  onDeleteEditor: async () => {},
  onSaveEditor: async () => {},
  onCloseEditor: async () => {},
};

/**
 * Allows the user to switch between different sessions.
 *
 * Not implemented yet.
 */
function SessionProvider({ children }: SessionProviderProps) {
  const [session, dispatch] = useReducer(reducer, initialFileState);
  const workerRef = useRef<Worker | null>(null);
  const proxyRef = useRef<Remote<SessionWorker> | null>(null);

  // initialize the worker
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const { type, payload } = e.data;
      switch (type) {
        // ----- session worker messages ------- //
        case "INITIALIZE_SESSION_START": {
          dispatch({
            type: "SET_STATUS",
            payload: {
              status: "loading_session",
            },
          });
          break;
        }
        case "INITIALIZE_SESSION_COMPLETE": {
          const { sessionId, directoryHandle, sources, editors } = payload;

          dispatch({
            type: "OPEN_SESSION",
            payload: {
              sessionId,
              directoryHandle,
              sources,
              editors,
            },
          });
          break;
        }

        case "INITIALIZE_SESSION_ERROR": {
          dispatch({
            type: "SET_STATUS",
            payload: {
              status: "error",
            },
          });

          toast.error("Error initializing session", {
            description: payload.error,
          });
          break;
        }

        // ------- editor views ------- //

        case "ADD_EDITOR": {
          dispatch({
            type: "ADD_EDITOR",
            payload,
          });
          break;
        }

        case "DELETE_EDITOR": {
          dispatch({
            type: "DELETE_EDITOR",
            payload,
          });
          break;
        }

        case "UPDATE_EDITOR": {
          dispatch({
            type: "UPDATE_EDITOR",
            payload,
          });
          break;
        }

        case "CLOSE_EDITOR": {
          dispatch({
            type: "CLOSE_EDITOR",
            payload,
          });
          break;
        }

        case "OPEN_EDITOR": {
          dispatch({
            type: "OPEN_EDITOR",
            payload,
          });
          break;
        }

        // ------- data sources ------- //

        case "ADD_SOURCES": {
          dispatch({
            type: "ADD_SOURCES",
            payload,
          });
          break;
        }
        case "REMOVE_SOURCE": {
          dispatch({
            type: "REMOVE_SOURCE",
            payload,
          });
          break;
        }

        default:
          break;
      }
    };
    const controller = new AbortController();
    const signal = controller.signal;

    const initWorker = async (sessionId: string) => {
      dispatch({
        type: "SET_STATUS",
        payload: {
          status: "initializing_worker",
        },
      });

      const worker = new Worker(new URL("./worker", import.meta.url), {
        name: "sessionWorker",
        type: "module",
      });

      workerRef.current = worker;

      const proxy = wrap<SessionWorker>(worker);
      proxyRef.current = proxy;

      dispatch({
        type: "SET_STATUS",
        payload: {
          status: "loading_session",
        },
      });

      if (signal.aborted) return;

      const sessionFiles = await proxy.onInitialize(sessionId);

      if (!sessionFiles) return;

      dispatch({
        type: "OPEN_SESSION",
        payload: {
          sessionId: initialFileState.sessionId,
          directoryHandle: sessionFiles.directoryHandle,
          sources: sessionFiles.sources,
          editors: sessionFiles.editors,
        },
      });
    };

    signal.addEventListener("abort", () => {
      workerRef.current?.removeEventListener("message", handleMessage);
      proxyRef.current?.[releaseProxy]();
      proxyRef.current = null;
      workerRef.current?.terminate();
      workerRef.current = null;
    });

    initWorker("quackdb");

    return () => {
      controller.abort();
    };
  }, []);

  /**
   * Update your session (i.e. open a new project).
   *
   * #TODO: Not implemented yet.
   */
  const onSessionChange = useCallback((session: string) => {
    console.log("Session change: ", session);
  }, []);

  const onAddSources = useCallback(
    async (handles: FileSystemFileHandle[]) => {
      if (!proxyRef.current) return;

      if (handles.length === 0) {
        toast.error("No files selected", {});
        return;
      }

      const sources: FileEntry<"SOURCE">[] = [];

      // #TODO: adjust worker to handle multiple files
      for (const handle of handles) {
        const res = await proxyRef.current.onAddSource({
          handle,
          name: handle.name,
          sessionId: session.sessionId,
          type: "FILE",
        });

        if (!res) {
          toast.error("Error adding source", {});
          return;
        }

        sources.push(res);
      }

      dispatch({
        type: "ADD_SOURCES",
        payload: sources,
      });
    },
    [session.sessionId],
  );

  const onAddEditor = useCallback(async () => {
    if (!proxyRef.current) return;

    try {
      const newEditor = await proxyRef.current.onAddEditor(session.sessionId);

      if (!newEditor) throw new Error("Failed to add editor");

      let content = "";

      if (newEditor.handle) {
        try {
          const file = await newEditor.handle.getFile();
          content = await file.text();
        } catch (e) {
          console.error("Failed to read file: ", e);
        }
      }

      dispatch({
        type: "ADD_EDITOR",
        payload: {
          ...newEditor,
          content,
          isFocused: false,
          isOpen: true,
          isDirty: false, // if it's new, it's not dirty. If we close it without saving, we should delete it.
          isSaved: false,
          isNew: true,
        },
      });

      dispatch({
        type: "FOCUS_EDITOR",
        payload: {
          path: newEditor.path,
        },
      });
    } catch (e) {
      console.error("Failed to add editor: ", e);
      toast.error("Failed to add editor", {
        description: e instanceof Error ? e.message : undefined,
      });
      return;
    }
  }, [session.sessionId]);

  /**
   * Permanently delete the editor from the session.
   *
   * #TODO: maybe archive the editor instead of deleting it.
   */
  const onDeleteEditor = useCallback(
    async (path: string) => {
      if (!proxyRef.current) return;

      try {
        const result = await proxyRef.current.onDeleteEditor({
          sessionId: session.sessionId,
          path,
        });

        if (result.error) throw new Error(result.error);

        dispatch({
          type: "DELETE_EDITOR",
          payload: {
            path,
          },
        });
      } catch (e) {
        console.error("Failed to delete editor: ", e);
        toast.error("Failed to delete editor", {
          description: e instanceof Error ? e.message : undefined,
        });
        return;
      }
    },
    [session.sessionId],
  );

  /**
   * Permanently delete the editor from the session.
   *
   * #TODO: maybe archive the editor instead of deleting it.
   */
  const onSaveEditor = useCallback(
    async (props: Pick<SaveEditorProps, "content" | "path">) => {
      if (!proxyRef.current) return;

      try {
        const result = await proxyRef.current.onSaveEditor({
          ...props,
          sessionId: session.sessionId,
        });

        if (result.error) throw result.error;

        if (!result.handle) throw new Error("Failed to save editor");

        dispatch({
          type: "SAVE_EDITOR",
          payload: {
            path: result.path,
            content: result.content,
            handle: result.handle,
          },
        });
      } catch (e) {
        console.error("Failed to save editor: ", e);
        toast.error("Failed to save editor", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    },
    [session.sessionId],
  );

  /**
   * When we close the editor, we need to save the content to the handle.
   *
   * If the handle is new and not dirty, we need to delete the handle.
   */
  const onCloseEditor = useCallback(
    async (path: string) => {
      if (!proxyRef.current) return;

      // find editor
      const editor = session.editors.find((editor) => editor.path === path);

      if (!editor) return;

      // if it's new and not dirty, we should delete it when we close it.
      // Otherwise, we end up with a bunch of empty / boiletplate files.
      const shouldDelete = editor.isNew && !editor.isDirty;

      if (shouldDelete) {
        try {
          const result = await proxyRef.current.onDeleteEditor({
            path,
            sessionId: session.sessionId,
          });

          if (result.error) throw result.error;

          dispatch({
            type: "DELETE_EDITOR",
            payload: {
              path,
            },
          });

          return;
        } catch (e) {
          console.error("Failed to save editor: ", e);
          toast.error("Failed to save editor", {
            description: e instanceof Error ? e.message : undefined,
          });
          return;
        }
      }

      dispatch({
        type: "CLOSE_EDITOR",
        payload: {
          path,
        },
      });
    },
    [session.editors, session.sessionId],
  );

  const value = useMemo(
    () => ({
      ...session,
      onSessionChange,
      dispatch,
      onAddSources,
      onAddEditor,
      onDeleteEditor,
      onSaveEditor,
      onCloseEditor,
    }),
    [
      onSessionChange,
      session,
      onAddSources,
      onAddEditor,
      onDeleteEditor,
      onSaveEditor,
      onCloseEditor,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export { SessionProvider };
