import type { editor } from "monaco-editor";

/**
 * Save the contents of the Monaco editor to local storage and restore it on page load.
 *
 * Should be used as a callback for the `onDidCreateEditor` event.
 *
 * @source https://github.com/rhashimoto/preview/blob/master/demo/demo.js
 */
export const onSaveToLocalStorage =
  (SQL_KEY: string) => (editor: editor.IStandaloneCodeEditor) => {
    // Persist editor content across page loads.
    let change: NodeJS.Timeout;
    const disposable = editor.onDidChangeModelContent(function () {
      clearTimeout(change);
      change = setTimeout(function () {
        localStorage.setItem(SQL_KEY, editor.getValue());
      }, 1000);
    });

    editor.setValue(localStorage.getItem(SQL_KEY) ?? "MONACO_EDITOR_CONTENT");

    return disposable;
  };
