import { KeyCode, KeyMod, type editor } from "monaco-editor";

/**
 * Add an SQL command formatter to the editor.
 *
 * Source https://github.com/axiomhq/monaco-kusto/blob/master/package/src/commandFormatter.ts
 */
export default class SQLCommandFormatter {
  private actionAdded: boolean = false;

  constructor(private editor: editor.IStandaloneCodeEditor) {
    // selection also represents no selection - for example the event gets triggered when moving cursor from point
    // a to point b. in the case start position will equal end position.
    editor.onDidChangeCursorSelection((_changeEvent) => {
      const languageId = this.editor.getModel()?.getLanguageId();
      if (!languageId) return;
      if (!["sql", "pgsql"].includes(languageId)) {
        return;
      }
      // Theoretically you would expect this code to run only once in onDidCreateEditor.
      // Turns out that onDidCreateEditor is fired before the IStandaloneEditor is completely created (it is emmited by
      // the super ctor before the child ctor was able to fully run).
      // Thus we don't have  a key binding provided yet when onDidCreateEditor is run, which is essential to call addAction.
      // By adding the action here in onDidChangeCursorSelection we're making sure that the editor has a key binding provider,
      // and we just need to make sure that this happens only once.
      if (!this.actionAdded) {
        editor.addAction({
          id: "editor.action.sql.formatCurrentCommand",
          label: "Format Command Under Cursor",
          keybindings: [
            KeyMod.chord(
              KeyMod.CtrlCmd | KeyCode.KeyK,
              KeyMod.CtrlCmd | KeyCode.KeyF,
            ),
          ],
          run: (_ed: editor.IStandaloneCodeEditor) => {
            editor.trigger(
              "SQLCommandFormatter",
              "editor.action.formatSelection",
              null,
            );
          },
          contextMenuGroupId: "1_modification",
        });
        this.actionAdded = true;
      }
    });
  }
}
