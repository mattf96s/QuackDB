import * as Comlink from "comlink";

type RenameFileOptions = {
  name: string;
};

/**
 * Rename a file in the OPFS.
 * Only Firefox supports the 'move' method on file handles (which is convenient in the browser).
 *
 */
async function renameFile(
  fileHandle: FileSystemFileHandle,
  options: RenameFileOptions,
) {
  postMessage({
    type: "rename-file-started",
    payload: {},
  });

  try {
    const root = await navigator.storage.getDirectory();
    const filename = options.name;
    const file = await fileHandle.getFile();

    // check that the name is different
    if (file.name === filename) {
      throw new Error("The new name is the same as the old name");
    }

    const buffer = await file.arrayBuffer();
    const draftHandle = await root.getFileHandle(filename, { create: true });

    // Get sync access handle
    const accessHandle = await draftHandle.createSyncAccessHandle();

    // Write to file
    accessHandle.write(buffer);
    accessHandle.flush();
    accessHandle.close();

    // Delete old file (Firefox doesn't support remove on file handles yet).
    if ("remove" in fileHandle) {
      // @ts-expect-error: remove is not in the type definition yet.
      await fileHandle.remove({ recursive: true });
    } else {
      await root.removeEntry(fileHandle.name);
    }

    postMessage({
      type: "rename-file-complete",
      payload: {
        fileHandle: accessHandle,
      },
    });
    return accessHandle;
  } catch (e) {
    console.error("Error renaming file: ", e);
    postMessage({
      type: "rename-file-error",
      payload: {
        error: e instanceof Error ? e.message : "Unknown error",
      },
    });
  }
}

export type RenameFileWorker = typeof renameFile;
Comlink.expose(renameFile);
