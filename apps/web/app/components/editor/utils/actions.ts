// // https://github.com/magic-akari/swc-ast-viewer/blob/main/src/monaco/action.ts
// import type { Monaco } from "@monaco-editor/react";
// import { reportIssue, shareMarkdown, shareURL } from "./share";

// export function copy_as_url(monaco: Monaco) {
//   monaco.editor.addEditorAction({
//     id: "swc-ast-viewer.copy-as-url",
//     label: "Copy as URL",
//     precondition: "!editorReadonly",
//     contextMenuOrder: 5,
//     contextMenuGroupId: "9_cutcopypaste",
//     run(editor) {
//       const code = editor.getValue();
//       const result = shareURL(code);
//       navigator.clipboard.writeText(result);
//     },
//   });
// }

// export function copy_as_markdown(monaco: Monaco) {
//   monaco.editor.addEditorAction({
//     id: "swc-ast-viewer.copy-as-markdown",
//     label: "Copy as Markdown Link",
//     precondition: "!editorReadonly",
//     contextMenuOrder: 5.1,
//     contextMenuGroupId: "9_cutcopypaste",
//     run(editor) {
//       const code = editor.getValue();
//       const result = shareMarkdown(code);
//       navigator.clipboard.writeText(result);
//     },
//   });
// }

// export function open_issue(monaco: Monaco) {
//   monaco.editor.addEditorAction({
//     id: "swc-ast-viewer.open-issue",
//     label: "Open Issue in SWC Repository",
//     precondition: "!editorReadonly",
//     contextMenuOrder: 3,
//     contextMenuGroupId: "issue",
//     run(editor) {
//       const code = editor.getValue();
//       const result = reportIssue(code);
//       window.open(result);
//     },
//   });
// }

// export function share(monaco: Monaco) {
//   monaco.editor.addEditorAction({
//     id: "swc-ast-viewer.share",
//     label: "Share",
//     precondition: "!editorReadonly && share_available",
//     contextMenuOrder: 4,
//     contextMenuGroupId: "share",
//     run(editor) {
//       const code = editor.getValue();
//       const url = shareURL(code);
//       navigator.share({
//         title: "SWC AST Viewer",
//         text: code,
//         url,
//       });
//     },
//   });
// }
