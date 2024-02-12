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
import { cn } from "@/lib/utils";
import { snippets } from "@/utils/duckdb/snippets";
import { conf, language } from "./pgsql";

type EditorProps = Exclude<MonacoEditorProps, "value"> & {
  value: string;
  onFocus?: () => void;
  onBlur?: () => void;
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

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.register({
      id: "pgsql",
      aliases: ["PostgreSQL", "postgres", "pg", "postgre"],
    });

    const configuration = monaco.languages.setLanguageConfiguration(
      "pgsql",
      conf,
    );
    disposables.current.push(configuration);

    const completions = monaco.languages.registerCompletionItemProvider(
      "pgsql",
      {
        provideCompletionItems: async (model, position, context, token) => {
          const word = model.getWordUntilPosition(position);
          const suggestions = getDefaultSuggestions();

          const filtered = word
            ? suggestions.filter((suggestion) =>
                suggestion.label
                  .toString()
                  .toLowerCase()
                  .includes(word.word.toLowerCase()),
              )
            : suggestions;

          const final = filtered.map((suggestion) => ({
            ...suggestion,
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn,
            ),
          }));

          return {
            suggestions: final,
          };
        },
      },
    );

    disposables.current.push(completions);

    const tokensDisposable = monaco.languages.setMonarchTokensProvider(
      "pgsql",
      language,
    );
    disposables.current.push(tokensDisposable);
  };

  const handleEditorDidMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      if (props.onFocus) {
        const disposable = editor.onDidFocusEditorText(props.onFocus);
        disposables.current.push(disposable);
      }
      if (props.onBlur) {
        const disposable = editor.onDidBlurEditorText(props.onBlur);
        disposables.current.push(disposable);
      }

      const saveAction = editorRef.current.addAction({
        id: "save-file",
        label: "Save File",
        keybindings: [KeyMod.CtrlCmd | KeyCode.KeyS],
        contextMenuGroupId: "navigation",
        contextMenuOrder: 1.5,
        run: onSaveFile,
      });

      disposables.current.push(saveAction);

      // editorRef.current.addAction({
      //   id: "format-file",
      //   label: "Format File",
      //   keybindings: [KeyMod.CtrlCmd | KeyCode.KEY_F],
      // })
    },
    [onSaveFile, props.onBlur, props.onFocus],
  );

  useImperativeHandle(
    ref,
    () => {
      return {
        getEditor() {
          return editorRef.current;
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
      language="pgsql"
      theme="vs"
      options={{
        "semanticHighlighting.enabled": true,
        language: "pgsql",
        fontSize: 15,
        fontFamily: "jetbrains-mono",
        formatOnType: true,
        autoClosingBrackets: "always",
        automaticLayout: true,
        renderLineHighlight: "all",
        lineDecorationsWidth: 15,
        lineNumbersMinChars: 2,
        scrollbar: {
          verticalScrollbarSize: 10,
        },

        folding: true,
        //scrollBeyondLastLine: false,
        minimap: {
          enabled: false,
        },

        suggest: {
          showFields: true,
          showKeywords: true,
          showValues: true,
          showVariables: true,
          showFiles: true,
          showWords: true,
        },
        bracketPairColorization: { enabled: true },
        matchBrackets: "always" as const,
        ...{ ...props.options },
      }}
      // options={{
      //   inlineSuggest: {
      //     enabled: true,
      //   },
      //   fontSize: 16,
      //   formatOnType: true,
      //   autoClosingBrackets: "always",
      //   automaticLayout: true,
      //   lineDecorationsWidth: 15,
      //   lineNumbersMinChars: 2,
      //   scrollbar: { alwaysConsumeMouseWheel: false },
      //   folding: false,
      //   scrollBeyondLastLine: false,
      //   minimap: {
      //     enabled: false,
      //   },
      //   lightbulb: {
      //     enabled: true,
      //   },
      //   suggest: {
      //     showFields: true,
      //     showKeywords: true,
      //     showValues: true,
      //     showVariables: true,
      //     showFiles: true,
      //     showWords: true,
      //   },
      //   bracketPairColorization: { enabled: true },
      //   matchBrackets: "always" as const,
      //   ...{ ...props.options },
      // }}
      {...props}
    />
  );
});

export default Editor;
