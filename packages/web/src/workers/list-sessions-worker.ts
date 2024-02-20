import * as Comlink from "comlink";

/**
 * List all files in the OPFS.
 * In the future, we might want to better accomodate for nested folders etc.
 */
async function listSessionsWorker() {
  const root = await navigator.storage.getDirectory();

  const sessionDirectory = await root.getDirectoryHandle("sessions", {
    create: true,
  });

  const sessions = [];

  for await (const key of sessionDirectory.keys()) {
    sessions.push(key);
  }

  return sessions;
}

export type ListSessionsWorker = typeof listSessionsWorker;
Comlink.expose(listSessionsWorker);
