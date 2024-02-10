import * as Comlink from "comlink";
import {
  type TreeNode,
  type TreeNodeData,
} from "@/components/files/context/types";

type FileWithRelativePath = File & {
  relativePath: string;
  handle: FileSystemFileHandle;
};

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

  const opfs = await navigator.storage.getDirectory();

  // Create a directory for the sessions
  const root = await opfs.getDirectoryHandle("sessions", { create: true });

  const sessionDirectory = await root.getDirectoryHandle(sessionName, {
    create: true,
  });

  // session will have the session file and then a directory of storage files

  // SQL session file.
  // If the file doesn't exist, create it and write some metadata.
  let sessionHandle: FileSystemFileHandle;

  try {
    sessionHandle = await sessionDirectory.getFileHandle("session.sql", {
      create: false,
    });
    // #TODO: create a backup of the session file which can be restored.
  } catch (e) {
    // Not found error
    if (e instanceof DOMException && e.name === "NotFoundError") {
      sessionHandle = await sessionDirectory.getFileHandle("session.sql", {
        create: true,
      });

      const textEncoder = new TextEncoder();

      // ------ create directory for storage files and create a demo.json file ------ //
      const storageDirectory = await sessionDirectory.getDirectoryHandle(
        "storage",
        { create: true },
      );

      // create a demo file
      const demoFile = await storageDirectory.getFileHandle("demo.json", {
        create: true,
      });
      const demoAccessHandle = await demoFile.createSyncAccessHandle();

      const salesData = [
        {
          name: "Sales",
          amount: 100,
          date: new Date("2021-01-01"),
        },
        {
          name: "Sales",
          amount: 120,
          date: new Date("2021-01-02"),
        },
        {
          name: "Sales",
          amount: 125,
          date: new Date("2021-01-03"),
        },
        {
          name: "Sales",
          amount: 135,
          date: new Date("2021-01-04"),
        },
        {
          name: "Sales",
          amount: 125,
          date: new Date("2021-01-05"),
        },
        {
          name: "Sales",
          amount: 130,
          date: new Date("2021-01-06"),
        },
        {
          name: "Sales",
          amount: 140,
          date: new Date("2021-01-07"),
        },
        {
          name: "Sales",
          amount: 150,
          date: new Date("2021-01-08"),
        },
        {
          name: "Sales",
          amount: 160,
          date: new Date("2021-01-09"),
        },
        {
          name: "Sales",
          amount: 170,
          date: new Date("2021-01-10"),
        },
      ];

      const salesContnet = textEncoder.encode(JSON.stringify(salesData));
      demoAccessHandle.write(salesContnet, { at: 0 });

      demoAccessHandle.flush();
      demoAccessHandle.close();

      // ---- Create a session file with metadata and querying the file we just created.

      const accessHandle = await sessionHandle.createSyncAccessHandle();

      const content = textEncoder.encode(`
      -- QuackDB Session File
      -- Created: ${new Date().toISOString()}
      -- Session Name: ${sessionName}
      -- Description: This file contains the SQL queries and metadata for the session.

      -- Create a table for the storage file
      CREATE OR REPLACE TABLE sales AS SELECT * FROM read_json_auto(demo.json);

      -- Query the table
      SELECT * FROM sales;
      `);

      accessHandle.write(content, { at: 0 });
      accessHandle.flush();
      accessHandle.close();
    }
  }

  // ------ get the storage directory and list all files ------ //

  const storageDirectory = await sessionDirectory.getDirectoryHandle(
    "storage",
    {
      create: true, // it is possible the browser has cleared the storage directory
    },
  );

  let count = 0;
  const fileTree: TreeNode<TreeNodeData>[] = [];

  try {
    const startingHandle = storageDirectory;

    // eslint-disable-next-line no-inner-declarations
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

    for await (const fileHandle of getFilesRecursively(storageDirectory)) {
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
  } catch (e) {
    console.error("Failed to get files: ", e);
    postMessage({
      type: "error",
      payload: {
        error: e instanceof Error ? e.message : "Something went wrong",
      },
    });
  }

  const h = await sessionDirectory.getFileHandle("session.sql", {
    create: false,
  });

  const results = {
    session: {
      name: sessionName,
      handle: h,
    },
    storage: {
      tree: fileTree,
      count,
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
