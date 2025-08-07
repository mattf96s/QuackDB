const pyodideWorker = new Worker(new URL("./worker", import.meta.url), {
  name: "sqlFluffWorker",
});

const callbacks = {};

pyodideWorker.onmessage = (event) => {
  const { id, ...data } = event.data;
  // @ts-expect-error - TODO: fix this
  const onSuccess = callbacks[id];
  // @ts-expect-error - TODO: fix this
  delete callbacks[id];
  onSuccess(data);
};

const asyncRun = (() => {
  let id = 0; // identify a Promise
  // @ts-expect-error - TODO: fix this
  return (script, context) => {
    // the id could be generated more carefully
    id = (id + 1) % Number.MAX_SAFE_INTEGER;
    return new Promise((onSuccess) => {
      // @ts-expect-error - TODO: fix this
      callbacks[id] = onSuccess;
      pyodideWorker.postMessage({
        ...context,
        python: script,
        id,
      });
    });
  };
})();

export { asyncRun };
