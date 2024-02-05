import "monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import MonacoEditor, {
  type BeforeMount,
  type EditorProps as MonacoEditorProps,
  type OnMount,
} from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import { cn } from "@/lib/utils";
import { conf, language } from "./pgsql";

type EditorProps = Exclude<MonacoEditorProps, "value"> & {
  value: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

export type EditorForwardedRef = {
  getEditor: () => editor.IStandaloneCodeEditor | null;
};

const Editor = forwardRef<EditorForwardedRef, EditorProps>((props, ref) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.languages.register({
      id: "pgsql",
      aliases: ["PostgreSQL", "postgres", "pg", "postgre"],
    });
    monaco.languages.setLanguageConfiguration("pgsql", conf);
    monaco.languages.registerCompletionItemProvider("pgsql", {
      provideCompletionItems: (model, position) => {
        const d = language.keywords as string[];
        const suggestions = [
          ...d
            .filter((k) => !!k)
            .map((keyword) => ({
              label: `${keyword}`,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: `${keyword}`,
              range: new monaco.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column,
              ),
            })),
        ];
        return {
          suggestions,
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
    },
    [props.onBlur, props.onFocus],
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
      className={cn("rounded-md border", props.className)}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      //height="90vh"

      language="pgsql"
      theme="vs-light"
      options={{
        "semanticHighlighting.enabled": true,
        language: "pgsql",
        fontSize: 15,
        fontFamily: "geist-mono",
        formatOnType: true,
        autoClosingBrackets: "always",
        automaticLayout: true,
        renderLineHighlight: "none",
        lineDecorationsWidth: 15,
        lineNumbersMinChars: 2,
        scrollbar: { alwaysConsumeMouseWheel: false },
        folding: false,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false,
        },
        lightbulb: {
          enabled: true,
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
