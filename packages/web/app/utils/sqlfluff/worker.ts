/// <reference lib="webworker" />

// Setup your project to serve `py-worker.js`. You should also serve
// `pyodide.js`, and all its associated `.asm.js`, `.json`,
// and `.wasm` files as well:
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

async function loadPyodideAndPackages() {
  // @ts-expect-error - TODO: fix this
  self.pyodide = await loadPyodide();
  // @ts-expect-error - TODO: fix this
  await self.pyodide.loadPackage("micropip");
  // @ts-expect-error - TODO: fix this
  const micropip = pyodide.pyimport("micropip");
  await micropip.install("sqlfluff");
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  // make sure loading is done
  await pyodideReadyPromise;
  // Don't bother yet with this line, suppose our API is built in such a way:
  const { id, python, ...context } = event.data;
  // The worker copies the context in its own "memory" (an object mapping name to values)
  for (const key of Object.keys(context)) {
    // @ts-expect-error - TODO: fix this
    self[key] = context[key];
  }
  // Now is the easy part, the one that is similar to working in the main thread:
  try {
    // @ts-expect-error - TODO: fix this
    await self.pyodide.loadPackagesFromImports(python);
    // @ts-expect-error - TODO: fix this
    const results = await self.pyodide.runPythonAsync(python);
    self.postMessage({ results, id });
  } catch (error) {
    // @ts-expect-error - TODO: fix this
    self.postMessage({ error: error.message, id });
  }
};
