import "monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import MonacoEditor, {
  type EditorProps as MonacoEditorProps,
  type Monaco,
  type OnMount,
} from "@monaco-editor/react";
import {
  type editor,
  type IDisposable,
  KeyCode,
  KeyMod,
  languages,
  Range,
} from "monaco-editor";
import { useQuery } from "@/context/query/useQuery";
import { cn } from "@/lib/utils";
import { useTheme } from "../theme-provider";
import { autocompleter } from "./helpers/autocomplete";
import { sqlConf, sqlDef } from "./syntax";

type EditorProps = Exclude<MonacoEditorProps, "value"> & {
  value: string;
  onSave?: (editor: editor.ICodeEditor) => Promise<void>;
  language?: string;
};

export type EditorForwardedRef = {
  getEditor: () => editor.IStandaloneCodeEditor | null;
};

const Editor = forwardRef<EditorForwardedRef, EditorProps>((props, ref) => {
  const monacoRef = useRef<Monaco | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { onRunQuery } = useQuery();

  const { theme } = useTheme();

  const language = props.language ?? "sql";
  const isDark = theme === "dark";

  useEffect(() => {
    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsReady(true);

    // ---------- save to local storage -------------- //

    // @source https://github.com/rhashimoto/preview/blob/master/demo/demo.js

    // let change: NodeJS.Timeout;
    // const disposable = editor.onDidChangeModelContent(function () {
    //   clearTimeout(change);
    //   change = setTimeout(function () {
    //     localStorage.setItem(
    //       CACHE_KEYS.SQL_EDITOR_CONTENT,
    //       editor.getValue(),
    //     );
    //   }, 1000);
    // });

    // disposables.current.push(disposable);

    // editor.setValue(
    //   localStorage.getItem(CACHE_KEYS.SQL_EDITOR_CONTENT) ??
    //     "MONACO_EDITOR_CONTENT",
    // );

    // ---------- Actions  -------------- //

    // add right-click menu run selection
    // const runSelection = editorRef.current.addAction({
    //   id: idLinkSelection,
    //   label: "🔗 Link to selection",
    //   contextMenuGroupId: "navigation_links",
    //   // We use ctrl/cmd + K to create a link, which is standard for hyperlinks.
    //   keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK],
    //   run: () => {
    //     if (
    //       datasetViewStore == null ||
    //       path == null ||
    //       field == null ||
    //       editor == null
    //     )
    //       return;

    //     const selection = editor.getSelection();
    //     if (selection == null) return;

    //     datasetViewStore.setTextSelection(path, {
    //       startLine: selection.startLineNumber,
    //       endLine: selection.endLineNumber,
    //       startCol: selection.startColumn,
    //       endCol: selection.endColumn,
    //     });
    //     editor.setSelection(selection);
    //   },
    // });

    // disposables.current.push(runSelection);

    // editor.addAction({
    //   id: "run-cell",
    //   label: "Run Cell",
    //   keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],

    //   contextMenuGroupId: "starboard",
    //   contextMenuOrder: 0,
    //   run: (_ed) => {
    //     runtime.controls.runCell({ id: cellId });
    //   },
    // });
  };

  useEffect(() => {
    const disposables: IDisposable[] = [];

    if (!editorRef.current) return;
    if (!monacoRef.current) return;
    if (!isReady) return;

    // SQL completion

    // register Monaco languages
    monacoRef.current.languages.register({
      id: language,
      extensions: [`.${language}`],
      aliases: [`${language.toLowerCase()}`, `${language.toUpperCase()}`],
    });

    // set LanguageConfiguration
    disposables.push(
      monacoRef.current.languages.setLanguageConfiguration(language, sqlConf),
    );
    // register setMonarchTokens Provider
    disposables.push(
      monacoRef.current.languages.setMonarchTokensProvider(language, sqlDef),
    );

    disposables.push(
      monacoRef.current.languages.registerCompletionItemProvider(language, {
        async provideCompletionItems(model, position, _context, _token) {
          const input = model.getValue();

          if (!input) {
            return {
              suggestions: [
                {
                  label: "SELECT",
                  kind: languages.CompletionItemKind.Keyword,
                  insertText: "SELECT",
                  range: new Range(1, 1, 1, 1),
                },
                {
                  label: "FROM",
                  kind: languages.CompletionItemKind.Keyword,
                  insertText: "FROM",
                  range: new Range(1, 1, 1, 1),
                },
              ],
              incomplete: true,
            };
          }

          const word = model.getWordUntilPosition(position);
          const range = new Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn,
          );

          const { suggestions } = autocompleter(word.word);

          const suggestionsWithRange = suggestions.map((suggestion) => ({
            detail: suggestion.detail,
            insertText: suggestion.insertText,
            kind: suggestion.kind,
            label: suggestion.label,
            range,
          }));

          return {
            suggestions: suggestionsWithRange,
            incomplete: true,
          };
        },
      }),
    );

    // create Monaco model

    disposables.push(monacoRef.current.editor.createModel("sql", language));

    // context menu actions

    // validate selected text

    disposables.push(
      editorRef.current.addAction({
        id: "validate-selection",
        label: "Validate Selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: async (editor) => {
          const selection = editor.getSelection();

          const value =
            selection?.isEmpty() || selection == null
              ? editor.getValue()
              : editor.getModel()?.getValueInRange(selection);
          console.log("Selected value:", value);
        },
      }),
    );

    return () => {
      disposables.forEach((disposable) => disposable.dispose());
    };
  }, [isReady, language]);

  // Add right-click menu run selection.
  // I don't want to the run fn to trigger the other actions.

  useEffect(() => {
    const disposables: IDisposable[] = [];

    if (!editorRef.current) return;
    if (!monacoRef.current) return;
    if (!isReady) return;

    // right click context menu
    disposables.push(
      editorRef.current.addAction({
        id: "run-selection",
        label: "Run Selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: (editor) => {
          const selection = editor.getSelection();

          const value =
            selection?.isEmpty() || selection == null
              ? editor.getValue()
              : editor.getModel()?.getValueInRange(selection);

          if (!value) return;

          onRunQuery(value ?? "");
        },
      }),
    );

    // cmd + space
    disposables.push(
      editorRef.current.addAction({
        id: "run-selection",
        label: "Run Selection",
        keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: async (editor) => {
          const selection = editor.getSelection();

          const value =
            selection?.isEmpty() || selection == null
              ? editor.getValue()
              : editor.getModel()?.getValueInRange(selection);

          if (!value) return;

          await onRunQuery(value ?? "");
        },
      }),
    );

    return () => {
      disposables.forEach((disposable) => disposable.dispose());
    };
  }, [isReady, onRunQuery]);

  // save
  useEffect(() => {
    const disposables: IDisposable[] = [];
    if (!editorRef.current) return;
    if (!monacoRef.current) return;
    if (!isReady) return;

    disposables.push(
      editorRef.current.addAction({
        id: "save-file",
        label: "Save File",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: async (editor) => {
          if (props.onSave) {
            const selection = editor.getSelection();

            const value =
              selection?.isEmpty() || selection == null
                ? editor.getValue()
                : editor.getModel()?.getValueInRange(selection);

            if (!value) return;
            props.onSave(editor);
          }
        },
      }),
    );

    return () => {
      disposables.forEach((disposable) => disposable.dispose());
    };
  }, [props, isReady]);

  useImperativeHandle(
    ref,
    () => {
      return {
        getEditor() {
          return editorRef.current;
        },
        getSelection() {
          const editor = editorRef.current;
          if (!editor) return null;

          const selection = editor.getSelection();
          if (selection) {
            return editor.getModel()?.getValueInRange(selection);
          }
          return;
        },
        getValues() {
          const editor = editorRef.current;
          if (!editor) return null;

          return editor.getModel()?.getValue();
        },
      };
    },
    [],
  );

  return (
    <MonacoEditor
      className={cn(props.className)}
      onMount={handleEditorDidMount}
      //height="90vh"
      defaultLanguage={language}
      theme={isDark ? "vs-dark" : "vs-light"}
      options={{
        fontFamily: "JetBrains Mono",
        smoothScrolling: false,
        automaticLayout: true,
        fontSize: 16,
        minimap: { enabled: false },
        wordWrap: "on",
        wrappingIndent: "same",
        wrappingStrategy: "advanced",
        scrollBeyondLastLine: false,
        "semanticHighlighting.enabled": true,
        renderLineHighlightOnlyWhenFocus: true,
        tabCompletion: "on",

        // scrollbar: { vertical: "auto", horizontal: "auto" },
        lineNumbers: "on",
        lineDecorationsWidth: 10,
        lineNumbersMinChars: 3,
        glyphMargin: true,
        folding: true,
        foldingStrategy: "auto",
        foldingHighlight: true,

        renderLineHighlight: "all",
        renderWhitespace: "none",

        quickSuggestions: true,
        quickSuggestionsDelay: 100,
        language,
      }}
      {...props}
    />
  );
});

export default Editor;
