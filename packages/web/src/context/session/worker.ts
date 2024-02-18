/// <reference lib="webworker" />
import * as Comlink from "comlink";
import { type Editor, type FileEntry, type Source } from "@/constants";
import type { CodeEditor, SessionState } from "./types";

type SessionFiles = Pick<
  SessionState,
  "directoryHandle" | "sources" | "editors" | "sessionId"
>;

// ------- Get session directory handle ------- //

const getSessionDirectory = async (sessionId: string) => {
  const root = await navigator.storage.getDirectory();

  // the session name shouldn't have any slashes but if it does, we'll split it and create the directories.
  const directories = sessionId.split("/");

  let directoryHandle = root;
  for (const dir of directories) {
    directoryHandle = await directoryHandle.getDirectoryHandle(dir, {
      create: true,
    });
  }

  return directoryHandle;
};

// ------- Initialize session (get files) ------- //

const onInitialize = async (sessionId: string) => {
  postMessage({
    type: "INITIALIZE_SESSION_START",
    payload: {
      sessionId,
    },
  });

  try {
    const directoryHandle = await getSessionDirectory(sessionId);

    const sources: FileEntry<"SOURCE">[] = [];
    const editors: FileEntry<"EDITOR">[] = [];

    // retrieve dataset sources, code editor files.
    // Ignore directories as we are using a flat file structure.
    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === "directory") continue;

      const meta = getMimeType(name);

      if (!meta) continue;

      const { mimeType, kind, ext } = meta;

      switch (kind) {
        case "EDITOR": {
          const entry: FileEntry<"EDITOR"> = {
            path: name,
            kind,
            ext,
            mimeType,
            handle,
          };
          editors.push(entry);
          postMessage({
            type: "INITIALIZE_EDITOR_FILE",
            payload: entry,
          });
          break;
        }
        case "SOURCE": {
          const entry: FileEntry<"SOURCE"> = {
            path: name,
            kind,
            ext,
            mimeType,
            handle,
          };
          sources.push(entry);
          postMessage({
            type: "INITIALIZE_SOURCE_FILE",
            payload: entry,
          });
          break;
        }
        default:
          break;
      }
    }

    const editorsWithContent: CodeEditor[] = editors.map((editor, i) => {
      const isFirst = i === 0;
      return {
        ...editor,
        isOpen: isFirst,
        isFocused: isFirst,
        isSaved: true,
        isDirty: false,
        content: "",
      };
    });

    const sessionFiles: SessionFiles = {
      sessionId,
      directoryHandle,
      sources,
      editors: editorsWithContent,
    };

    postMessage({
      type: "INITIALIZE_SESSION_COMPLETE",
      payload: sessionFiles,
    });

    return sessionFiles;
  } catch (e) {
    console.error("Error initializing session in worker: ", e);
    postMessage({
      type: "INITIALIZE_SESSION_ERROR",
      payload: {
        error: e instanceof Error ? e.message : "Unknown error",
      },
    });
    return null;
  }
};

function getMimeType(
  name: string,
):
  | Pick<Source, "mimeType" | "kind" | "ext">
  | Pick<Editor, "mimeType" | "kind" | "ext">
  | null {
  const lastDot = name.lastIndexOf("."); // allow index.worker.ts
  if (lastDot === -1) {
    return null;
  }
  const ext = name.slice(lastDot + 1);
  if (!ext) return null;

  switch (ext) {
    case "csv":
      return { mimeType: "text/csv", kind: "SOURCE", ext: "csv" };
    case "json":
      return { mimeType: "application/json", kind: "SOURCE", ext: "json" };
    case "txt":
      return { mimeType: "text/plain", kind: "SOURCE", ext: "txt" };
    case "duckdb":
      return { mimeType: "application/duckdb", kind: "SOURCE", ext: "duckdb" };
    case "sqlite":
      return { mimeType: "application/sqlite", kind: "SOURCE", ext: "sqlite" };
    case "postgresql":
      return {
        mimeType: "application/postgresql",
        kind: "SOURCE",
        ext: "postgresql",
      };
    case "parquet":
      return {
        mimeType: "application/parquet",
        kind: "SOURCE",
        ext: "parquet",
      };
    case "arrow":
      return { mimeType: "application/arrow", kind: "SOURCE", ext: "arrow" };
    case "excel":
      return { mimeType: "application/excel", kind: "SOURCE", ext: "excel" };
    case "sql":
      return { mimeType: "text/sql", kind: "EDITOR", ext: "sql" };
    case "js":
      return { mimeType: "text/javascript", kind: "EDITOR", ext: "js" };
    case "py":
      return { mimeType: "text/python", kind: "EDITOR", ext: "py" };
    case "ts":
      return { mimeType: "text/typescript", kind: "EDITOR", ext: "ts" };
    case "rs":
      return { mimeType: "text/rust", kind: "EDITOR", ext: "rs" };
    default:
      return null;
  }
}

// --- Add new data source -- //

/**
 * If we receive a file handle, it's from the user's local file system and we need to copy and store it in the opfs.
 */
type NewSourceType = "FILE" | "URL";

type AddSourceBase = {
  sessionId: string;
  name: string; // with the extension
};

type OnAddSourceProps<T extends NewSourceType> = T extends "FILE"
  ? {
      type: T;
      handle: FileSystemFileHandle;
    }
  : {
      type: T;
      url: string;
    };

const onAddSource = async <T extends NewSourceType>(
  props: AddSourceBase & OnAddSourceProps<T>,
) => {
  const { type, name, sessionId } = props;
  postMessage({
    type: "ADD_SOURCE_START",
    payload: {
      name,
      type,
    },
  });

  const directory = await getSessionDirectory(sessionId);

  const meta = getMimeType(name);

  if (!meta || meta.kind !== "SOURCE") {
    postMessage({
      type: "ADD_SOURCE_ERROR",
      payload: {
        name,
        type,
      },
    });
    return null;
  }

  // Check that the file name is unique. If not, append a number to the end.
  let counter = 0;
  const paths = name.split(".");
  const ext = paths.pop();
  let path = paths.join(".");

  while (true) {
    const exists = await directory
      .getFileHandle(name, { create: false })
      .catch(() => null);
    if (!exists) break;
    counter++;
    path = `${path}-${counter}.${ext}`;
  }

  try {
    switch (type) {
      case "FILE": {
        const { handle } = props;
        const file = await handle.getFile();

        const draftHandle = await directory.getFileHandle(path, {
          create: true,
        });
        const accessHandle = await draftHandle.createSyncAccessHandle();

        const buffer = await file.arrayBuffer();

        accessHandle.write(buffer);
        // Flush the changes.
        accessHandle.flush();
        accessHandle.close();

        const source: FileEntry<"SOURCE"> = {
          path: name,
          kind: meta.kind,
          mimeType: meta.mimeType,
          ext: meta.ext,
          handle: draftHandle, // not the original file handle we received.
        };

        postMessage({
          type: "SOURCE_FILE_COMPLETE",
          payload: source,
        });

        return source;
      }
      // save URL as a URI file (don't download the file, just store the URL as a file in the opfs).
      case "URL": {
        const { url } = props;
        const draftHandle = await directory.getFileHandle(path, {
          create: true,
        });
        const accessHandle = await draftHandle.createSyncAccessHandle();
        const textEncoder = new TextEncoder();
        const buffer = textEncoder.encode(url);
        accessHandle.write(buffer);
        // Flush the changes.
        accessHandle.flush();
        accessHandle.close();

        const source: FileEntry<"SOURCE"> = {
          path: name,
          kind: meta.kind,
          mimeType: meta.mimeType,
          ext: meta.ext,
          handle: draftHandle,
        };

        postMessage({
          type: "SOURCE_FILE_COMPLETE",
          payload: source,
        });

        return source;
      }
    }
  } catch (e) {
    console.error("Error adding source: ", e);
    postMessage({
      type: "ADD_SOURCE_ERROR",
      payload: {
        name,
        type,
      },
    });
    return null;
  }
};

// ----------------------------//

const methods = {
  onInitialize,
  onAddSource,
};

export type SessionWorker = typeof methods;
Comlink.expose(methods);
