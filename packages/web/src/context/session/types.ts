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
};

export type SessionState = {
  status: "initializing_worker" | "loading_session" | "ready" | "error";
  sessionId: string;
  onSessionChange: (session: string) => void;
  directoryHandle: FileSystemDirectoryHandle | null;
  editors: CodeEditor[];
  sources: Source[];
};
