import * as Comlink from "comlink";

type SaveWorkerProps = {
  handle: FileSystemFileHandle;
  content: string;
  path: string;
};

async function saveWorker({ content, handle, path }: SaveWorkerProps) {
  try {
    const syncHandle = await handle.createSyncAccessHandle();
    const encoder = new TextEncoder();

    syncHandle.write(encoder.encode(content), {
      at: 0,
    });

    syncHandle.flush();
    syncHandle.close();

    postMessage({
      type: "SAVED_FILE",
      payload: {
        handle,
        content,
        path,
        error: null,
      },
    });

    return {
      handle,
      content,
      path,
      error: null,
    };
  } catch (error) {
    postMessage({
      type: "SAVE_ERROR",
      payload: {
        handle,
        content,
        path,
        error,
      },
    });

    return {
      error,
    };
  }
}

/**
 * Save file changes to opfs.
 */
export type SaveWorker = typeof saveWorker;
Comlink.expose(saveWorker);
