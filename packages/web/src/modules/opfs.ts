// type FileEntry = {
//   handle: FileSystemFileHandle;
//   path: string;
// }

// /**
//  * OPFS access handle pool.
//  *
//  * Allow a session to have many different sql files, duckdb files, datasets, etc.
//  *
//  * See [wa-sqlite](https://github.com/rhashimoto/wa-sqlite/blob/master/src/examples/AccessHandlePoolVFS.js#L190) for reference implementation.
//  */
// export class OPFS {
//   // All the OPFS files the VFS uses are contained in one flat directory
//   // specified in the constructor. No other files should be written here.
//   #directoryPath: string
//   #directoryHandle: FileSystemDirectoryHandle

//   #handles = new Set()

//   isReady: Promise<void>

//   constructor(directoryPath: string) {
//     this.#directoryPath = directoryPath;
//     this.isReady = this.reset().then(async () => {
//       if (this.getCapacity() === 0) {
//         await this.addCapacity(DEFAULT_CAPACITY);
//       }
//     });
//   }

//   listFiles() {

//   }

//   async close() {
//     await this.#releaseAccessHandles();
//   }

//   /**
//    * Release and reacquire all OPFS access handles. This must be called
//    * and awaited before any SQLite call that uses the VFS and also before
//    * any capacity changes.
//    */
//   async reset() {
//     await this.isReady;

//     // All files are stored in a single root directory.
//     let handle = await navigator.storage.getDirectory();

//     // keep going down the path, creating directories as needed.
//     // Set the directory handle to the last directory in the path.
//     for (const d of this.#directoryPath.split('/')) {
//       if (d) {
//         handle = await handle.getDirectoryHandle(d, { create: true });
//       }
//     }
//     this.#directoryHandle = handle;

//     await this.#releaseAccessHandles();
//     await this.#acquireAccessHandles();
//   }

//   async #acquireAccessHandles() {
//     // Enumerate all the files in the directory.
//     const files: [string, FileSystemFileHandle][] = [];
//     for await (const [name, handle] of this.#directoryHandle) {
//       if (handle.kind === 'file') {
//         files.push([name, handle]);
//       }
//     }

//     // Open access handles in parallel, separating associated and unassociated.
//     await Promise.all(files.map(async ([name, handle]) => {
//       const accessHandle = await handle.createSyncAccessHandle();
//       this.#mapAccessHandleToName.set(accessHandle, name);
//       const path = this.#getAssociatedPath(accessHandle);
//       if (path) {
//         this.#mapPathToAccessHandle.set(path, accessHandle);
//       } else {
//         this.#availableAccessHandles.add(accessHandle);
//       }
//     }));
//   }

//   #releaseAccessHandles() {
//     for (const accessHandle of this.#mapAccessHandleToName.keys()) {
//       accessHandle.close();
//     }
//     this.#mapAccessHandleToName.clear();
//     this.#mapPathToAccessHandle.clear();
//     this.#availableAccessHandles.clear();
//   }

// }
