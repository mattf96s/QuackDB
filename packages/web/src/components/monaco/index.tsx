import "monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import MonacoEditor, {
  type BeforeMount,
  type EditorProps as MonacoEditorProps,
  type OnMount,
} from "@monaco-editor/react";
import {
  type editor,
  type IDisposable,
  KeyCode,
  KeyMod,
  languages,
} from "monaco-editor";
import { CACHE_KEYS } from "@/constants";
import { cn } from "@/lib/utils";
import { snippets } from "@/utils/duckdb/snippets";
import { conf, language } from "./pgsql";

type EditorProps = Exclude<MonacoEditorProps, "value"> & {
  value: string;
  onSave?: (value: string) => void;
};

export type EditorForwardedRef = {
  getEditor: () => editor.IStandaloneCodeEditor | null;
};

type PartialMonacoCompletionItem = Pick<
  languages.CompletionItem,
  "label" | "kind" | "insertText" | "detail"
>;

const getDefaultSuggestions = (): PartialMonacoCompletionItem[] => {
  const keywords: PartialMonacoCompletionItem[] = (
    language.keywords as string[]
  ).map((keyword) => ({
    label: keyword,
    kind: languages.CompletionItemKind.Keyword,
    insertText: keyword,
  }));

  const fns: PartialMonacoCompletionItem[] = (
    language.builtinFunctions as string[]
  ).map((fn) => ({
    label: fn,
    kind: languages.CompletionItemKind.Function,
    insertText: fn,
  }));

  const operators: PartialMonacoCompletionItem[] = (
    language.operators as string[]
  ).map((op) => ({
    label: op,
    kind: languages.CompletionItemKind.Operator,
    insertText: op,
  }));

  const duckdbSnippets: PartialMonacoCompletionItem[] = snippets.map(
    (snippet) => ({
      label: snippet.name,
      kind: languages.CompletionItemKind.Snippet,
      insertText: snippet.code,
      detail: snippet.description,
    }),
  );

  return [...duckdbSnippets, ...keywords, ...fns, ...operators];
};

const Editor = forwardRef<EditorForwardedRef, EditorProps>((props, ref) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const disposables = useRef<IDisposable[]>([]);

  const onSaveFile = useCallback(async () => {
    if (!props.onSave) return;

    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const value = model.getValue();
    props.onSave(value);
  }, [props]);

  // function disposals(items: IDisposable[]){
  //   while (items.length > 0) {
  //     const disposable = items.pop();
  //     if (disposable) {
  //       disposable.dispose();
  //     }
  //   }
  // }

  useEffect(() => {
    return () => {
      if (disposables.current.length > 0) {
        disposables.current.forEach((disposable) => disposable.dispose());
        disposables.current = [];
      }
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  const handleEditorWillMount: BeforeMount = useCallback((monaco) => {
    monaco.languages.register({
      id: "pgsql",
      aliases: ["Postgres", "PostgreSQL", "psql", "sql"],
    });

    const configuration = monaco.languages.setLanguageConfiguration(
      "pgsql",
      conf,
    );

    disposables.current.push(configuration);

    // const completions = monaco.languages.registerCompletionItemProvider("sql", {
    //   provideCompletionItems: async (model, position, context, token) => {
    //     const word = model.getWordUntilPosition(position);
    //     const suggestions = getDefaultSuggestions();

    //     const filtered = word
    //       ? suggestions.filter((suggestion) =>
    //           suggestion.label
    //             .toString()
    //             .toLowerCase()
    //             .includes(word.word.toLowerCase()),
    //         )
    //       : suggestions;

    //     const final = filtered.map((suggestion) => ({
    //       ...suggestion,
    //       range: new monaco.Range(
    //         position.lineNumber,
    //         word.startColumn,
    //         position.lineNumber,
    //         word.endColumn,
    //       ),
    //     }));

    //     return {
    //       suggestions: final,
    //     };
    //   },
    // });

    // disposables.current.push(completions);

    const tokensDisposable = monaco.languages.setMonarchTokensProvider(
      "pgsql",
      language,
    );

    disposables.current.push(tokensDisposable);
  }, []);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      // ---------- save to local storage -------------- //

      // @source https://github.com/rhashimoto/preview/blob/master/demo/demo.js

      let change: NodeJS.Timeout;
      const disposable = editor.onDidChangeModelContent(function () {
        clearTimeout(change);
        change = setTimeout(function () {
          localStorage.setItem(
            CACHE_KEYS.SQL_EDITOR_CONTENT,
            editor.getValue(),
          );
        }, 1000);
      });

      disposables.current.push(disposable);

      editor.setValue(
        localStorage.getItem(CACHE_KEYS.SQL_EDITOR_CONTENT) ??
          "MONACO_EDITOR_CONTENT",
      );

      // ---------- Actions  -------------- //

      const saveAction = editorRef.current.addAction({
        id: "save-file",
        label: "Save File",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: onSaveFile,
      });

      disposables.current.push(saveAction);

      // add right-click menu run selection

      const runActionDisposable = editorRef.current.addAction({
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
          console.log("Selected value:", value);
        },
      });

      disposables.current.push(runActionDisposable);

      // validate selected text

      const validateActionDisposable = editorRef.current.addAction({
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
      });

      disposables.current.push(validateActionDisposable);

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
    },
    [onSaveFile],
  );

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
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      //height="90vh"
      defaultLanguage="pgsql"
      theme="vs"
      options={{
        "semanticHighlighting.enabled": true,
        language: "pgsql",
        fontSize: 16,
        fontFamily: "jetbrains-mono",
        //formatOnType: true,
        autoClosingBrackets: "always",
        automaticLayout: true,
        renderLineHighlight: "all",
        lineDecorationsWidth: 15,
        lineNumbersMinChars: 2,
        scrollbar: {
          useShadows: false,
          vertical: "auto",
          horizontal: "auto",
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          alwaysConsumeMouseWheel: false,
        },
        renderLineHighlightOnlyWhenFocus: true,

        folding: true,
        //scrollBeyondLastLine: false,
        minimap: {
          enabled: false,
        },

        // suggest: {
        //   showFields: true,
        //   showKeywords: true,
        //   showValues: true,
        //   showVariables: true,
        //   showFiles: true,
        //   showWords: true,
        // },
        bracketPairColorization: { enabled: true },
        matchBrackets: "always" as const,
        ...{ ...props.options },
      }}
      {...props}
    />
  );
});

export default Editor;
