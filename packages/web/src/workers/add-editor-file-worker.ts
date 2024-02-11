import * as Comlink from "comlink";
import type { editor } from "monaco-editor";

/**
 * Add a file to the editor state.
 *
 * The structure is explained in the readme.
 */
async function addEditorFileWorker({ session }: { session: string }) {
  const root = await navigator.storage.getDirectory();
  const sessionsDirectory = await root.getDirectoryHandle("sessions", {
    create: true,
  });

  const thisSessionDirectory = await sessionsDirectory.getDirectoryHandle(
    session,
    {
      create: true,
    },
  );

  // --------- create metadata file ------------- //

  const metadataHandle = await thisSessionDirectory.getFileHandle(
    "metadata.txt",
    {
      create: true,
    },
  );
  const metadataAccessHandle = await metadataHandle.createSyncAccessHandle();
  const textEncoder = new TextEncoder();
  const metadataContent = textEncoder.encode(`
  -- QuackDB Session Metadata
  -- Created: ${new Date().toISOString()}
  -- Session Name: ${session}
  -- Description: This file contains the metadata for the session.
  `);
  metadataAccessHandle.write(metadataContent, { at: 0 });
  metadataAccessHandle.flush();
  metadataAccessHandle.close();

  // --------- create a dataset directory and demo dataset ------------- //

  const datasetDirectory = await thisSessionDirectory.getDirectoryHandle(
    "datasets",
    {
      create: true,
    },
  );

  const demoFile = await datasetDirectory.getFileHandle("demo.json", {
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

  // --------- create vscode editor files ----------//

  const editorDirectory = await thisSessionDirectory.getDirectoryHandle(
    "editors",
    {
      create: true,
    },
  );

  // create a new editor file directory
  const editorFile = await editorDirectory.getDirectoryHandle("my-new-file", {
    create: true,
  });

  // create a new editor file
  const editorFileHandle = await editorFile.getFileHandle("editor-state.json", {
    create: true,
  });

  const newFileContents: editor.ICodeEditorViewState = {
    viewState: {},
  };

  try {
    console.log("creating session file");
  } catch (e) {
    // Not found error
    if (e instanceof DOMException && e.name === "NotFoundError") {
      sessionHandle = await sessionDirectory.getFileHandle(
        "editor-state.json",
        {
          create: true,
        },
      );

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

export type AddEditorFileWorker = typeof addEditorFileWorker;
Comlink.expose(addEditorFileWorker);
