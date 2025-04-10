/// <reference lib="webworker" />
import * as Comlink from "comlink";
/**
 * Check if the browser can transfer file system handles (WebKit has a bug with this).
 */
async function isSupported() {
    try {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getDirectoryHandle("__test__", { create: true });
        postMessage({
            type: "success",
            body: {
                handle,
            },
        });
        return true;
    }
    catch (e) {
        console.error("Error in worker: ", e);
        return false;
    }
}
Comlink.expose(isSupported);
