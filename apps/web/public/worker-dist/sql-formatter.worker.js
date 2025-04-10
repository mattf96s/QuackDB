"use strict";
/// <reference lib="webworker" />
// https://github.com/vercel/turborepo/issues/3643#issuecomment-2689349937
self.onmessage = async (event) => {
    const { code, options = {} } = event.data;
    const formatter = await import(
    // @ts-expect-error this works but installing libraries does not (probably cause of the way the worker is bundled to get around Turbopack limitation)
    "https://cdn.jsdelivr.net/npm/@wasm-fmt/sql_fmt@0.1.0/+esm");
    await formatter.default().init();
    const formattedCode = await formatter.default().format(code, "query.sql", {
        lines_between_queries: 2,
        indent_style: "tab",
        ...options,
    });
    self.postMessage({
        type: "FORMATTED",
        formattedCode,
        code,
    });
};
