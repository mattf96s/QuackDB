import * as Comlink from "comlink";
import  { type TreeNode, type TreeNodeData } from "@/components/files/context";

type FileWithRelativePath = File & {
  relativePath: string;
  handle: FileSystemFileHandle;
};

/**
 * List all files in the OPFS.
 * In the future, we might want to better accomodate for nested folders etc.
 */
async function getDirectoryFilesWorker(startingDirectory?: string) {
  postMessage({
    type: "start",
    payload: {},
  });

  let count = 0;

  try {
    const directoryHandle = await navigator.storage.getDirectory();
    let startingHandle = directoryHandle;

    if (startingDirectory) {
      startingHandle = await directoryHandle.getDirectoryHandle(
        startingDirectory,
        { create: false },
      );
      if (!startingHandle) {
        throw new Error("Directory not found");
      }
    }

    async function* getFilesRecursively(
      entry: FileSystemDirectoryHandle | FileSystemFileHandle,
    ): AsyncGenerator<FileWithRelativePath> {
      if (entry.kind === "file") {
        const file = await entry.getFile();
        if (file !== null) {
          const relativePath = (await startingHandle.resolve(entry)) ?? [];
          yield Object.assign(file, {
            relativePath: relativePath.join("/"),
            handle: entry,
          });
        }
      } else if (entry.kind === "directory") {
        for await (const handle of entry.values()) {
          yield* getFilesRecursively(handle);
        }
      }
    }

    const fileTree: TreeNode<TreeNodeData>[] = [];

    for await (const fileHandle of getFilesRecursively(directoryHandle)) {
      const newEntry = {
        id: fileHandle.name,
        name: fileHandle.name,
        data: {
          fileSize: fileHandle.size,
          fileType: fileHandle.type,
          handle: fileHandle.handle,
          lastModified: fileHandle.lastModified,
        },
      };

      fileTree.push(newEntry);
      count++;

      postMessage({
        type: "progress",
        payload: { file: newEntry, count },
      });
    }

    postMessage({
      type: "complete",
      payload: { tree: fileTree, count },
    });
  } catch (e) {
    console.error("Failed to get directory tree: ", e);
    postMessage({
      type: "error",
      payload: {
        error: e instanceof Error ? e.message : "Something went wrong",
      },
    });
  }
}

export type GetDirectoryFilesWorker = typeof getDirectoryFilesWorker;
Comlink.expose(getDirectoryFilesWorker);
