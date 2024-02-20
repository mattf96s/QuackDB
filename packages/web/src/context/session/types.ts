import type { Editor, Source } from "@/constants";

/**
 * Each code file and its state including within the tabs.
 */
export type CodeEditor = Editor & {
  isOpen: boolean;
  isFocused: boolean;
  isSaved: boolean;
  isDirty: boolean;
  handle: FileSystemFileHandle;
  content: string;
  // when adding a new file, we should delete it if it's not saved
  isNew: boolean;
};

export type SessionState = {
  status: "initializing_worker" | "loading_session" | "ready" | "error";
  sessionId: string;
  onSessionChange: (session: string) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  editors: CodeEditor[];
  sources: Source[];
  dispatch: React.Dispatch<Action> | null;
  onAddSources: (handles: FileSystemFileHandle[]) => Promise<void>;
  onAddEditor: () => Promise<void>;
  onDeleteEditor: (path: string) => Promise<void>;
  onSaveEditor: (props: SaveEditorProps) => Promise<void>;
  onCloseEditor: (path: string) => Promise<void>;
};

// saving file
export type SaveEditorProps = {
  content: string;
  path: string;
};

export type SaveEditorResponse = SaveEditorProps & {
  handle: FileSystemFileHandle | undefined;
  error: Error | null;
};

// session reducer

type AddSources = {
  type: "ADD_SOURCES";
  payload: Source[];
};

type RemoveSource = {
  type: "REMOVE_SOURCE";
  payload: {
    path: string;
  };
};

type OpenEditor = {
  type: "OPEN_EDITOR";
  payload: {
    path: string;
  };
};

type SaveEditor = {
  type: "SAVE_EDITOR";
  payload: {
    path: string;
    content: string;
    handle: FileSystemFileHandle;
  };
};

type FocusEditor = {
  type: "FOCUS_EDITOR";
  payload: {
    path: string;
  };
};

type CloseEditor = {
  type: "CLOSE_EDITOR";
  payload: {
    path: string;
  };
};

type AddEditor = {
  type: "ADD_EDITOR";
  payload: CodeEditor;
};

type DeleteEditor = {
  type: "DELETE_EDITOR";
  payload: {
    path: string;
  };
};

type UpdateEditor = {
  type: "UPDATE_EDITOR";
  payload: {
    path: string;
    content: string;
  };
};

type OpenSession = {
  type: "OPEN_SESSION";
  payload: Pick<
    SessionState,
    "sessionId" | "directoryHandle" | "editors" | "sources"
  >;
};

type SetStatus = {
  type: "SET_STATUS";
  payload: { status: SessionState["status"] };
};

type RefreshEditor = {
  type: "REFRESH_EDITOR";
  payload: {
    path: string;
    handle: FileSystemFileHandle;
  };
};

export type Action =
  | AddSources
  | RemoveSource
  | OpenEditor
  | SaveEditor
  | FocusEditor // tabs can be open without being focused
  | CloseEditor
  | AddEditor
  | DeleteEditor
  | UpdateEditor
  | OpenSession
  | SetStatus
  | RefreshEditor;
