// workers/get-file-contents.worker.ts
self.onmessage = async (event) => {
  self.postMessage({
    type: "SET_LOADING",
    loading: true
  });
  const { id } = event.data;
  try {
    const directory = await navigator.storage.getDirectory();
    const handle = await directory.getFileHandle(id, { create: true });
    const file = await handle.getFile();
    const contents = await file.text() ?? "";
    self.postMessage({
      type: "SET_CONTENTS",
      contents
    });
  } catch (error) {
    console.error("Error in worker: ", error);
    self.postMessage({
      type: "SET_ERROR",
      error: error instanceof Error ? error.message : String(error)
    });
    return;
  }
};
//# sourceMappingURL=get-file-contents.worker.js.map
