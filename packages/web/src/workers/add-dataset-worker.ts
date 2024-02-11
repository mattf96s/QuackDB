import * as Comlink from "comlink";

type AddDatasetWorkerProps = {
  session: string;
  handles: { fileHandle: FileSystemFileHandle; filename: string }[];
};

/**
 * Save files from frontend filepicker to our origin private file system.
 */
const addDatasetWorker = async ({
  handles,
  session,
}: AddDatasetWorkerProps) => {
  if (handles.length === 0) {
    return {
      error: "No files to add",
      handles: [],
    };
  }

  // ensure the added files are unique
  const uniqueFilenames = new Set<string>();
  for (const { filename } of handles) {
    if (uniqueFilenames.has(filename)) {
      console.error("Duplicate filename: ", filename);
      return {
        error: "Duplicate filename",
        handles: [],
      };
    }
    uniqueFilenames.add(filename);
  }

  const root = await navigator.storage.getDirectory();
  const sessions = await root.getDirectoryHandle("sessions", {
    create: true,
  });

  const sessionDir = await sessions.getDirectoryHandle(session, {
    create: true,
  });

  const datasetDir = await sessionDir.getDirectoryHandle("datasets", {
    create: true,
  });

  // check if the dataset already exists

  const handlesForInsertion = [...handles];

  // for await (const entry of handles) {
  //   if (uniqueFilenames.has(entry.filename)) {
  //     // check if it's the same file
  //     try {
  //       const existingDirectory = await datasetDir.getDirectoryHandle(
  //         entry.filename,
  //         {
  //           create: false,
  //         },
  //       );

  //     } catch (e) {}

  //     const existingFileHandle = await existingDirectory.getFileHandle(
  //       entry.filename,
  //       { create: false },
  //     );

  //     const isSameHandle =
  //       await entry.fileHandle.isSameEntry(existingFileHandle);

  //     if (isSameHandle) {
  //       // remove the handle from the list
  //       const index = handlesForInsertion.findIndex(
  //         (handle) => handle.filename === entry.filename,
  //       );
  //       handlesForInsertion.splice(index, 1);
  //     }

  //     return {
  //       error: "Duplicate filename",
  //       handles: [],
  //     };
  //   }
  // }

  const addedHandles: FileSystemFileHandle[] = [];

  try {
    for (const { fileHandle, filename } of handlesForInsertion) {
      const dataDirectory = await datasetDir.getDirectoryHandle(filename, {
        create: true,
      });

      const handle = await dataDirectory.getFileHandle("editor-state.json", {
        create: true,
      });

      const accessHandle = await handle.createSyncAccessHandle();

      const file = await fileHandle.getFile();
      const buffer = await file.arrayBuffer();

      accessHandle.write(buffer, {
        at: 0,
      });

      accessHandle.flush();
      accessHandle.close();

      addedHandles.push(handle);
    }

    return {
      error: null,
      handles: addedHandles,
    };
  } catch (e) {
    console.error("Error adding datasets: ", e);
    return {
      error: "Error adding datasets",
      handles: addedHandles,
    };
  }
};

export type AddDatasetWorker = typeof addDatasetWorker;
Comlink.expose(addDatasetWorker);
