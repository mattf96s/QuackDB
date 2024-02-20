import * as Comlink from "comlink";

type SaveSessionProps = {
  sessionState: string; // editor.ICodeEditorViewState serialized to string
  session: string; // session name
};

const saveSession = async ({ session, sessionState }: SaveSessionProps) => {
  try {
    const root = await navigator.storage.getDirectory();

    const sessionDirectory = await root.getDirectoryHandle(session, {
      create: true,
    });

    const fileHandle = await sessionDirectory.getFileHandle(
      "editor-state.json",
      {
        create: true,
      },
    );

    const file = await fileHandle.getFile();

    const size = file.size;

    //----- Versioning: if the file exists, save a versioned copy ----- //

    if (size > 0) {
      const versionDirectory = await sessionDirectory.getDirectoryHandle(
        "versions",
        {
          create: true,
        },
      );

      // if more than 10 versions, delete the oldest
      const versions: FileSystemFileHandle[] = [];
      for await (const [, handle] of versionDirectory.entries()) {
        // ignore directory entries
        if (handle.kind === "directory") {
          continue;
        }
        versions.push(handle);
      }

      if (versions.length > 10) {
        const inDateOrder = versions.sort((a, b) => {
          const dateSuffixA = a.name
            .replace("editor-state-", "")
            .replace(".json", "");
          const dateSuffixB = b.name
            .replace("editor-state-", "")
            .replace(".json", "");
          return Number(dateSuffixA) - Number(dateSuffixB);
        });

        const oldestVersions = inDateOrder.slice(0, versions.length - 10);

        for (const version of oldestVersions) {
          await versionDirectory.removeEntry(version.name, { recursive: true });
        }
      }

      const versionedFile = await versionDirectory.getFileHandle(
        `editor-state-${Date.now()}.json`,
        {
          create: true,
        },
      );

      const draftHandle = await versionedFile.createSyncAccessHandle();

      const buffer = await file.arrayBuffer();
      draftHandle.write(buffer, {
        at: 0,
      });
      draftHandle.close();
      draftHandle.flush();
    }

    const accessHandle = await fileHandle.createSyncAccessHandle();

    // serialized json
    const encoder = new TextEncoder();
    const encoded = encoder.encode(sessionState);

    accessHandle.write(encoded, { at: 0 });

    accessHandle.close();
    accessHandle.flush();

    return {
      success: true,
      sessionHandle: fileHandle,
      error: null,
    };
  } catch (e) {
    console.error("Error saving session state: ", e);
    return {
      success: false,
      sessionHandle: null,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
};

export type SaveSessionWorker = typeof saveSession;
Comlink.expose(saveSession);
