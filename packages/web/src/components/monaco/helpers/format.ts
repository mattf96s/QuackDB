// import type { editor, Position } from "monaco-editor";

// const computeOffset = (code: string, pos: Position) => {
//   let line = 1;
//   let col = 1;
//   let offset = 0;
//   while (offset < code.length) {
//     if (line === pos.lineNumber && col === pos.column) return offset;
//     if (code[offset] === "\n") line++, (col = 1);
//     else col++;
//     offset++;
//   }
//   return -1;
// };
// /**
//  * Source: https://github.com/lukejacksonn/monacode/blob/master/index.js
//  */
// export const formatFiles =
//   (editor: editor.IStandaloneCodeEditor) => (e: Event) => {
//     e.preventDefault();
//     const val = editor.getValue();
//     const pos = editor.getPosition();

//     const prettyVal = prettier.formatWithCursor(val, {
//       parser: "babel",
//       plugins: prettierBabel,
//       cursorOffset: computeOffset(val, pos),
//     });

//     editor.executeEdits("prettier", [
//       {
//         identifier: "delete",
//         range: editor.getModel().getFullModelRange(),
//         text: "",
//         forceMoveMarkers: true,
//       },
//     ]);

//     editor.executeEdits("prettier", [
//       {
//         identifier: "insert",
//         range: new monaco.Range(1, 1, 1, 1),
//         text: prettyVal.formatted,
//         forceMoveMarkers: true,
//       },
//     ]);

//     editor.setSelection(new monaco.Range(0, 0, 0, 0));
//     editor.setPosition(
//       computePosition(prettyVal.formatted, prettyVal.cursorOffset),
//     );
//   };
