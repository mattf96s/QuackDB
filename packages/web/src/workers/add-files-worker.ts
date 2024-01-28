import * as Comlink from "comlink";

postMessage({
  type: "IS_READY",
  payload: {},
});

/**
 * Add file handles to OPFS (from window.showOpenFilePicker, for example).
 * This method is really quick.
 * We could probably do more files at once based on the user hardware.
 */
async function addFilesHandles(newHandles: FileSystemFileHandle[]) {
  const total = newHandles.length;

  postMessage({
    type: "start",
    payload: { total },
  });

  const opfsRoot = await navigator.storage.getDirectory();

  let count = 0;

  try {
    // write files to directory
    for (const handle of newHandles) {
      // get file contents
      const file = await handle.getFile();

      // create a new file handle
      const fileHandle = await opfsRoot.getFileHandle(file.name, {
        create: true,
      });

      const accessHandle = await fileHandle.createSyncAccessHandle();

      const buffer = await fileToBuffer(file);

      accessHandle.write(buffer);
      accessHandle.flush();
      accessHandle.close();

      count++;

      postMessage({
        type: "progress",
        payload: { count, total, filename: file.name },
      });
    }

    postMessage({
      type: "complete",
      payload: { total: count },
    });
  } catch (e) {
    console.error("Failed to add files: ", e);
    postMessage({
      type: "error",
      payload: {
        error: e instanceof Error ? e.message : "Something went wrong",
      },
    });
  }
}

/**
 * Convert a file to a buffer.
 */
async function fileToBuffer(file: File) {
  const reader = new FileReader();
  const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
  return buffer;
}

export type AddFilesHandlesWorker = typeof addFilesHandles;
Comlink.expose(addFilesHandles);
