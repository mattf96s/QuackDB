// // https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/fmt.ts
// import type { Monaco } from "@monaco-editor/react";
// import init, { format } from "@wasm-fmt/sql_fmt/vite";

// init();

// export function config_fmt(monaco: Monaco) {
//   monaco.languages.registerDocumentFormattingEditProvider(
//     ["sql", "mysql", "pgsql", "sqlite", "mssql", "plsql", "tsql"],
//     {
//       provideDocumentFormattingEdits(model, options) {
//         const text = model.getValue();
//         const indent_style = options.insertSpaces ? "space" : "tab";
//         const indent_width = options.tabSize;

//         try {
//           const formatted = format(text, model.uri.path, {
//             indent_style,
//             indent_width,
//           });

//           return [
//             {
//               range: model.getFullModelRange(),
//               text: formatted,
//             },
//           ];
//         } catch (error) {
//           console.error(error);
//           return [];
//         }
//       },
//     },
//   );
// }
