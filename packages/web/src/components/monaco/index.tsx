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
import { type editor, languages } from "monaco-editor";
import { cn } from "@/lib/utils";
import { snippets } from "@/utils/duckdb/snippets";
import { conf, language } from "./pgsql";

type EditorProps = Exclude<MonacoEditorProps, "value"> & {
  value: string;
  onFocus?: () => void;
  onBlur?: () => void;
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

  const onSaveFile = useCallback(async () => {
    const editor = editorRef.current;
    if (editor) {
      const model = editor.getModel();
      if (model) {
        const value = model.getValue();
        console.log(value);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
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
    monaco.languages.setLanguageConfiguration("pgsql", conf);
    monaco.languages.registerCompletionItemProvider("pgsql", {
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
    });
    monaco.languages.setMonarchTokensProvider("pgsql", language);
  };

  const handleEditorDidMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      if (props.onFocus) {
        editor.onDidFocusEditorText(props.onFocus);
      }
      if (props.onBlur) {
        editor.onDidBlurEditorText(props.onBlur);
      }

      editor.setValue(props.value);
    },
    [props.onBlur, props.onFocus, props.value],
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
        renderLineHighlight: "none",
        lineDecorationsWidth: 15,
        lineNumbersMinChars: 2,
        scrollbar: {
          verticalScrollbarSize: 10,
        },

        folding: false,
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
