import * as Comlink from "comlink";

async function getFileAsBuffer(fileHandle: FileSystemFileHandle) {
  const file = await fileHandle.getFile();
  return file.arrayBuffer();
}

/**
 * Create a new file handle with a unique name
 */
async function createFileHandle(
  fileHandle: FileSystemFileHandle,
  options?: Pick<DuplicateFileOptions, "suggestedName">,
) {
  const filename = options?.suggestedName || fileHandle.name;
  // Ensure filename doesn't contain file extension
  const parts = filename.split(".");

  // has no extension. Could maybe instead get the file from the handle and then get the filetype from that.
  if (parts.length === 1) {
    throw new Error("File has no extension");
  }

  const opfsRoot = await navigator.storage.getDirectory();

  const startingFilename = parts[0]; // don't include the extension. Don't include other dots in the filename.

  const extension = parts[parts.length - 1];
  let name = startingFilename;
  let counter = 0;

  while (true) {
    // try to get the file handle. If it doesn't exist, we can use this name.

    if (counter > 3) {
      name = `${startingFilename}_${Date.now()}`;
      break;
    }
    try {
      const filenameWithExt = `${name}.${extension}`;
      await opfsRoot.getFileHandle(filenameWithExt, { create: false });
      name = `${startingFilename} (${counter + 1})`; // +1 because we start at 0 and it looks nicer.
      counter++;
    } catch (e) {
      // if the file doesn't exist, we can use this name.
      break;
    }
  }

  const finalName = `${name}.${extension}`;

  const newFileHandle = await opfsRoot.getFileHandle(finalName, {
    create: true,
  });
  return newFileHandle;
}

type DuplicateFileOptions = {
  suggestedName?: string;
};

/**
 * Duplicate a file in the OPFS.
 *
 */
async function duplicateFile(
  fileHandle: FileSystemFileHandle,
  options?: DuplicateFileOptions,
) {
  postMessage({
    type: "duplicate-file-started",
    payload: {},
  });

  try {
    const [newFileHandle, buffer] = await Promise.all([
      createFileHandle(fileHandle, options),
      getFileAsBuffer(fileHandle),
    ]);

    // Get sync access handle
    const accessHandle = await newFileHandle.createSyncAccessHandle();

    // Write to file
    await accessHandle.write(buffer);
    await accessHandle.flush();
    await accessHandle.close();

    postMessage({
      type: "duplicate-file-complete",
      payload: {
        fileHandle: newFileHandle,
      },
    });
    return newFileHandle;
  } catch (e) {
    console.error("Error duplicating file: ", e);
    postMessage({
      type: "duplicate-file-error",
      payload: {
        error: e instanceof Error ? e.message : "Unknown error",
      },
    });
  }
}

export type DuplicateFileWorker = typeof duplicateFile;
Comlink.expose(duplicateFile);
