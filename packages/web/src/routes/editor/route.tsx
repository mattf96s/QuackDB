import "monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution";
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { Editor, type OnMount } from "@monaco-editor/react";
import { createFileRoute } from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import {
  type editor,
  type IDisposable,
  type languages,
  Range,
} from "monaco-editor";
import PanelHandle from "@/components/panel-handle";
import { sqlConf, sqlDef } from "./-syntax/index";
import type { AutocompleterWorker } from "./-worker";

export const Route = createFileRoute("/editor")({
  component: EditorPage,
});

type EditorProps = {
  language: string;
};

function EditorPage() {
  return (
    <div className="flex size-full flex-1 flex-col gap-10 p-10">
      <h1>Editor</h1>
      <PanelGroup direction="vertical">
        <Panel maxSize={50}>
          <p>This is a panel</p>
        </Panel>
        <PanelHandle />
        <Panel maxSize={50}>
          <Suspense fallback={<p>loading...</p>}>
            <MyMonacoEditor language="sql" />
          </Suspense>
        </Panel>
      </PanelGroup>
    </div>
  );
}

function MyMonacoEditor({ language }: EditorProps) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const workerRef = useRef<Remote<AutocompleterWorker> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const worker: Worker = new Worker(
      new URL("./-worker/index.ts", import.meta.url),
      { name: "codeWorker", type: "module" },
    );

    workerRef.current = wrap<AutocompleterWorker>(worker);

    return () => {
      workerRef.current?.[releaseProxy]();
      worker.terminate();
    };
  }, []);

  const onMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsReady(true);
  };

  useEffect(() => {
    const disposables: IDisposable[] = [];
    if (!monacoRef.current) return;
    if (!isReady) return;
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

          if (!input) return;

          const word = model.getWordUntilPosition(position);
          const range = new Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn,
          );

          const instance = workerRef.current;

          if (!instance) {
            console.error("Worker not initialized");
            throw new Error("worker not initialized");
          }

          const suggestions = (await instance(
            input,
            // @ts-expect-error: types are not correct
            range,
          )) as unknown as languages.CompletionItem[];

          return {
            suggestions,
            incomplete: true,
          };
        },
      }),
    );

    // create Monaco model

    disposables.push(monacoRef.current.editor.createModel("sql", language));

    // editorRef.current?.setModel(model);

    // const m = editorRef.current?.getModel();

    // add the error markers and underline
    //   model.onDidChangeContent(function () {
    //     const sqlAutocomplete = new SQLAutocomplete(SQLDialect.MYSQL);
    //     const error = sqlAutocomplete.validate(
    //       editorRef.current?.getValue() ?? "",
    //     );
    //     const monacoErrors: monaco.editor.IMarkerData[] = [];
    //     for (const e of error) {
    //       monacoErrors.push({
    //         startLineNumber: e.startLineNumber,
    //         startColumn: e.startColumn,
    //         endLineNumber: e.endLineNumber,
    //         endColumn: e.endColumn,
    //         message: e.message,
    //         severity: monaco.MarkerSeverity.Error,
    //       });
    //     }
    //     const model = editorRef.current?.getModel();
    //     monaco.editor.setModelMarkers(model!, language, monacoErrors);
    //   });

    return () => {
      disposables.forEach((d) => d.dispose());
    };
  }, [language, isReady]);

  useEffect(() => {
    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  return (
    <div>
      <Editor
        height="90vh"
        defaultValue="select * from table"
        defaultLanguage="sql"
        loading={<p>loading...</p>}
        onMount={onMount}
        className="w-full"
        language={language}
        theme="vs-dark"
        options={{
          smoothScrolling: false,
          automaticLayout: true,
          fontSize: 16,
          minimap: { enabled: false },
          wordWrap: "on",
          wrappingIndent: "same",
          wrappingStrategy: "advanced",
          scrollBeyondLastLine: false,
          scrollbar: { vertical: "auto", horizontal: "auto" },
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
        }}
      />
    </div>
  );
}
