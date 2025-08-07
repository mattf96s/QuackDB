// https://github.com/windmill-labs/windmill/blob/05a1e19b5e3c2e26d858e5024bbc3494da0abf4c/frontend/src/lib/components/Editor.svelte#L212C9-L231C3
// function setCode(ncode: string, noHistory: boolean = false): void {
//   code = ncode
//   if (noHistory) {
//     editor?.setValue(ncode)
//   } else {
//     if (editor?.getModel()) {
//       // editor.setValue(ncode)
//       editor.pushUndoStop()

//       editor.executeEdits('set', [
//         {
//           range: editor.getModel()!.getFullModelRange(), // full range
//           text: ncode
//         }
//       ])

//       editor.pushUndoStop()
//     }
//   }
// }

// https://github.com/windmill-labs/windmill/blob/05a1e19b5e3c2e26d858e5024bbc3494da0abf4c/frontend/src/lib/components/Editor.svelte#L233C9-L253C1
// function append(code): void {
//   if (editor) {
//     const lineCount = editor.getModel()?.getLineCount() || 0
//     const lastLineLength = editor.getModel()?.getLineLength(lineCount) || 0
//     const range: IRange = {
//       startLineNumber: lineCount,
//       startColumn: lastLineLength + 1,
//       endLineNumber: lineCount,
//       endColumn: lastLineLength + 1
//     }
//     editor.executeEdits('append', [
//       {
//         range,
//         text: code,
//         forceMoveMarkers: true
//       }
//     ])
//     editor.revealLine(lineCount)
//   }
// }
