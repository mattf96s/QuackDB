// import { Range, type editor } from "monaco-editor/esm/vs/editor/editor.api";

// /**
//  * Selects the whole line when clicking on the line number.
//  *
//  * @source https://github.com/opensumi/core/blob/ccd710f47f4ef56ae047de51be5844c9749c4afd/packages/monaco/src/browser/monaco.service.ts#L98C3-L118C4
//  */
// export function lineSelector(editor: editor.ICodeEditor) {
//   return editor.onMouseDown((e) => {
//     // if click on line number, select the whole line
//     if (e.target.type === 6) {
//       const lineNumber =
//         e.target.position?.lineNumber || e.target.range?.startLineNumber;
//       if (!lineNumber) {
//         return;
//       }

//       editor.setSelection(
//         new Range(
//           lineNumber,
//           e.target.range?.startColumn || e.target.position?.column || 0,
//           lineNumber + 1,
//           e.target.range?.startColumn || e.target.position?.column || 0,
//         ),
//       );
//     }
//   });
// }
