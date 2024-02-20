import * as Comlink from "comlink";

/**
 * List all files in the OPFS.
 * In the future, we might want to better accomodate for nested folders etc.
 */
async function getSessionWorker(sessionName: string) {
  postMessage({
    type: "start",
    payload: {
      session: sessionName,
    },
  });

  const root = await navigator.storage.getDirectory();

  const sessionsDirectory = await root.getDirectoryHandle("sessions", {
    create: true,
  });

  const thisSessionDirectory = await sessionsDirectory.getDirectoryHandle(
    sessionName,
    {
      create: true,
    },
  );

  // ------- get the metadata file -------- //

  const metadataHandle = await thisSessionDirectory.getFileHandle(
    "metadata.txt",
    {
      create: true,
    },
  );

  // ------ get editor files -------- //
  const vscodeDirectory = await thisSessionDirectory.getDirectoryHandle(
    "editors",
    {
      create: true,
    },
  );

  type FileEntry = {
    handle: FileSystemFileHandle;
    name: string;
  };

  const editorEntries: FileEntry[] = [];

  for await (const [key, entry] of vscodeDirectory.entries()) {
    // ignore non-directory entries
    if (entry.kind === "file") continue;

    const editorDirectory = await vscodeDirectory.getDirectoryHandle(key, {
      create: true,
    });

    try {
      const handle = await editorDirectory.getFileHandle("editor-state.json", {
        create: false,
      });

      editorEntries.push({
        handle,
        name: key,
      });
    } catch (e) {
      console.error("Error reading file: ", e);
      // Not found error. Remove the directory.
      // if (e instanceof DOMException && e.name === "NotFoundError") {
      //   await vscodeDirectory.removeEntry(key, { recursive: true });
      // }
    }
  }

  // ------ datasets -------- //

  const datasetsDirectory = await thisSessionDirectory.getDirectoryHandle(
    "datasets",
    { create: true },
  );

  const datasets: FileEntry[] = [];

  for await (const [key, value] of datasetsDirectory.entries()) {
    if (value.kind === "file") continue;
    try {
      const fileHandle = await value.getFileHandle("editor-state.json", {
        create: false,
      });

      datasets.push({
        handle: fileHandle,
        name: key,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotFoundError") {
        console.error("Error reading file: ", e);
      }
    }
  }

  const results = {
    metadata: metadataHandle,
    editors: editorEntries,
    datasets,
    session: {
      name: sessionName,
      handle: thisSessionDirectory,
    },
  };

  postMessage({
    type: "complete",
    payload: results,
  });
  return results;
}

export type GetSessionWorker = typeof getSessionWorker;
Comlink.expose(getSessionWorker);
