// types/tree.ts
async function buildStructuredTreeFromHandle(dirHandle) {
  const tree = [];
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "file") {
      tree.push({
        type: "file",
        name
      });
    } else if (handle.kind === "directory") {
      const subTree = await buildStructuredTreeFromHandle(handle);
      tree.push({
        type: "folder",
        name,
        contents: subTree
      });
    }
  }
  return tree;
}

// workers/get-session.worker.ts
self.onmessage = async (event) => {
  self.postMessage({
    type: "SET_LOADING",
    loading: true
  });
  const { id } = event.data;
  try {
    const root = await navigator.storage.getDirectory();
    const directory = await root.getDirectoryHandle(id, { create: true });
    const tree = await buildStructuredTreeFromHandle(directory);
    self.postMessage({
      type: "SET_CONTENTS",
      tree
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
//# sourceMappingURL=get-session.worker.js.map
