"use client";
import { useDB } from "@/context/db/useDB";
import { useQuery } from "@/context/query/useQuery";
import { cn } from "@/lib/utils";
import { formatSQL } from "@/utils/sql_fmt";
import MonacoEditor, {
	type EditorProps as MonacoEditorProps,
	type OnMount,
} from "@monaco-editor/react";
// import {
// 	type IDisposable,
// 	KeyCode,
// 	KeyMod,
// 	Range,
// 	type editor,
// 	languages,
// } from "monaco-editor";
import "monaco-editor/esm/vs/basic-languages/sql/sql.contribution";
import { useTheme } from "next-themes";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { SuggestionMaker } from "./suggestions";
import { sqlConf, sqlDef } from "./syntax";

import {
	type IDisposable,
	KeyCode,
	KeyMod,
	Range,
	languages,
} from "monaco-editor";
import type { Editor as IStandaloneCodeEditor, Monaco } from "./types";

type EditorProps = Exclude<MonacoEditorProps, "value"> & {
	value: string;
	onSave?: (editor: IStandaloneCodeEditor) => Promise<void>;
	language?: string;
};

export type EditorForwardedRef = {
	getEditor: () => IStandaloneCodeEditor | null;
};

const Editor = forwardRef<EditorForwardedRef, EditorProps>((props, ref) => {
	const monacoRef = useRef<Monaco | null>(null);
	const editorRef = useRef<IStandaloneCodeEditor | null>(null);
	const [isReady, setIsReady] = useState(false);

	const { onRunQuery } = useQuery();
	const { db } = useDB();

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

	// formatter
	useEffect(() => {
		const disposables: IDisposable[] = [];

		if (!editorRef.current) return;
		if (!monacoRef.current) return;
		if (!isReady) return;

		disposables.push(
			monacoRef.current.languages.registerDocumentFormattingEditProvider(
				"sql",
				{
					async provideDocumentFormattingEdits(model, _options) {
						const formatted = await formatSQL(model.getValue());
						return [
							{
								range: model.getFullModelRange(),
								text: formatted,
							},
						];
					},
				},
			),
		);

		// define a range formatting provider
		// select some codes and right click those codes
		// you contextmenu will have an "Format Selection" action
		disposables.push(
			monacoRef.current.languages.registerDocumentRangeFormattingEditProvider(
				"sql",
				{
					async provideDocumentRangeFormattingEdits(model, range, _options) {
						const formatted = await formatSQL(model.getValueInRange(range));
						return [
							{
								range: range,
								text: formatted,
							},
						];
					},
				},
			),
		);

		return () => {
			disposables.forEach((disposable) => disposable.dispose());
		};
	}, [isReady]);

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

		// create Monaco model

		disposables.push(monacoRef.current.editor.createModel("sql", language));

		// ----- context menu actions ------ //

		// #TODO: validate selected text (investigate serialize json function).

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

					if (!value) return;

					await onRunQuery(value);
				},
			}),
		);

		return () => {
			disposables.forEach((disposable) => disposable.dispose());
		};
	}, [isReady, language, onRunQuery]);

	// completions

	useEffect(() => {
		const disposables: IDisposable[] = [];

		if (!monacoRef.current) return;
		if (!isReady) return;
		if (!db) return;

		const suggestor = new SuggestionMaker(db);

		// register Monaco languages
		monacoRef.current.languages.register({
			id: language,
			extensions: [`.${language}`],
			aliases: [`${language.toLowerCase()}`, `${language.toUpperCase()}`],
		});

		disposables.push(
			monacoRef.current.languages.registerCompletionItemProvider(language, {
				async provideCompletionItems(model, position, _context, _token) {
					const query = model.getValue();

					const { word, endColumn, startColumn } =
						model.getWordUntilPosition(position);

					const range = new Range(
						position.lineNumber,
						startColumn,
						position.lineNumber,
						endColumn,
					);

					const controller = new AbortController();
					const { signal } = controller;

					const suggestions = await suggestor.getSuggestions({
						query,
						word,
						range,
						signal,
					});

					return {
						suggestions,
						incomplete: true,
						dispose() {
							controller.abort();
						},
					};
				},
			}),
		);

		return () => {
			disposables.forEach((disposable) => disposable.dispose());
		};
	}, [db, isReady, language]);

	/**
	 * SQL type coercion completions (e.g. sales::int).
	 *
	 * Source: https://github.com/windmill-labs/windmill/blob/05a1e19b5e3c2e26d858e5024bbc3494da0abf4c/frontend/src/lib/components/Editor.svelte#L281
	 */

	useEffect(() => {
		const disposables: IDisposable[] = [];

		if (!monacoRef.current) return;
		if (!isReady) return;
		if (!db) return;

		// register Monaco languages
		disposables.push(
			monacoRef.current.languages.registerCompletionItemProvider("sql", {
				triggerCharacters: [":"],
				provideCompletionItems: (model, position) => {
					const lineUntilPosition = model.getValueInRange({
						startLineNumber: position.lineNumber,
						startColumn: 1,
						endLineNumber: position.lineNumber,
						endColumn: position.column,
					});
					let suggestions: languages.CompletionItem[] = [];
					if (lineUntilPosition.endsWith("::")) {
						const word = model.getWordUntilPosition(position);
						const range = {
							startLineNumber: position.lineNumber,
							endLineNumber: position.lineNumber,
							startColumn: word.startColumn,
							endColumn: word.endColumn,
						};
						// select list(UPPER(type_name)) from DUCKDB_TYPES();
						suggestions = [
							"BIGINT",
							"BINARY",
							"BIT",
							"BITSTRING",
							"BLOB",
							"BOOL",
							"BOOLEAN",
							"BPCHAR",
							"BYTEA",
							"CHAR",
							"DATE",
							"DATETIME",
							"DEC",
							"DECIMAL",
							"DOUBLE",
							"ENUM",
							"FLOAT",
							"FLOAT4",
							"FLOAT8",
							"GUID",
							"HUGEINT",
							"INT",
							"INT1",
							"INT128",
							"INT16",
							"INT2",
							"INT32",
							"INT4",
							"INT64",
							"INT8",
							"INTEGER",
							"INTEGRAL",
							"INTERVAL",
							"LIST",
							"LOGICAL",
							"LONG",
							"MAP",
							"NULL",
							"NUMERIC",
							"NVARCHAR",
							"OID",
							"REAL",
							"ROW",
							"SHORT",
							"SIGNED",
							"SMALLINT",
							"STRING",
							"STRUCT",
							"TEXT",
							"TIME",
							"TIMESTAMP",
							"TIMESTAMPTZ",
							"TIMESTAMP_MS",
							"TIMESTAMP_NS",
							"TIMESTAMP_S",
							"TIMESTAMP_US",
							"TIMETZ",
							"TINYINT",
							"UBIGINT",
							"UHUGEINT",
							"UINT128",
							"UINT16",
							"UINT32",
							"UINT64",
							"UINT8",
							"UINTEGER",
							"UNION",
							"USMALLINT",
							"UTINYINT",
							"UUID",
							"VARBINARY",
							"VARCHAR",
							"BIGINT",
							"BINARY",
							"BIT",
							"BITSTRING",
							"BLOB",
							"BOOL",
							"BOOLEAN",
							"BPCHAR",
							"BYTEA",
							"CHAR",
							"DATE",
							"DATETIME",
							"DEC",
							"DECIMAL",
							"DOUBLE",
							"ENUM",
							"FLOAT",
							"FLOAT4",
							"FLOAT8",
							"GUID",
							"HUGEINT",
							"INT",
							"INT1",
							"INT128",
							"INT16",
							"INT2",
							"INT32",
							"INT4",
							"INT64",
							"INT8",
							"INTEGER",
							"INTEGRAL",
							"INTERVAL",
							"LIST",
							"LOGICAL",
							"LONG",
							"MAP",
							"NULL",
							"NUMERIC",
							"NVARCHAR",
							"OID",
							"REAL",
							"ROW",
							"SHORT",
							"SIGNED",
							"SMALLINT",
							"STRING",
							"STRUCT",
							"TEXT",
							"TIME",
							"TIMESTAMP",
							"TIMESTAMPTZ",
							"TIMESTAMP_MS",
							"TIMESTAMP_NS",
							"TIMESTAMP_S",
							"TIMESTAMP_US",
							"TIMETZ",
							"TINYINT",
							"UBIGINT",
							"UHUGEINT",
							"UINT128",
							"UINT16",
							"UINT32",
							"UINT64",
							"UINT8",
							"UINTEGER",
							"UNION",
							"USMALLINT",
							"UTINYINT",
							"UUID",
							"VARBINARY",
							"VARCHAR",
							"BIGINT",
							"BINARY",
							"BIT",
							"BITSTRING",
							"BLOB",
							"BOOL",
							"BOOLEAN",
							"BPCHAR",
							"BYTEA",
							"CHAR",
							"DATE",
							"DATETIME",
							"DEC",
							"DECIMAL",
							"DOUBLE",
							"ENUM",
							"FLOAT",
							"FLOAT4",
							"FLOAT8",
							"GUID",
							"HUGEINT",
							"INT",
							"INT1",
							"INT128",
							"INT16",
							"INT2",
							"INT32",
							"INT4",
							"INT64",
							"INT8",
							"INTEGER",
							"INTEGRAL",
							"INTERVAL",
							"LIST",
							"LOGICAL",
							"LONG",
							"MAP",
							"NULL",
							"NUMERIC",
							"NVARCHAR",
							"OID",
							"REAL",
							"ROW",
							"SHORT",
							"SIGNED",
							"SMALLINT",
							"STRING",
							"STRUCT",
							"TEXT",
							"TIME",
							"TIMESTAMP",
							"TIMESTAMPTZ",
							"TIMESTAMP_MS",
							"TIMESTAMP_NS",
							"TIMESTAMP_S",
							"TIMESTAMP_US",
							"TIMETZ",
							"TINYINT",
							"UBIGINT",
							"UHUGEINT",
							"UINT128",
							"UINT16",
							"UINT32",
							"UINT64",
							"UINT8",
							"UINTEGER",
							"UNION",
							"USMALLINT",
							"UTINYINT",
							"UUID",
							"VARBINARY",
							"VARCHAR",
						].map((t) => ({
							label: t,
							kind: languages.CompletionItemKind.Function,
							insertText: t,
							range: range,
							sortText: "a",
						}));
					}

					return {
						suggestions,
					};
				},
			}),
		);

		return () => {
			disposables.forEach((disposable) => disposable.dispose());
		};
	}, [db, isReady]);

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
				run: props.onSave ?? (() => {}),
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
			loading={<p>Loading...</p>}
			//height="90vh"
			defaultLanguage={language}
			theme={isDark ? "vs-dark" : "vs-light"}
			options={{
				fontFamily: "'jetbrains-mono'",
				smoothScrolling: true,
				automaticLayout: true,
				//fontSize: 16,
				minimap: { enabled: false },
				scrollBeyondLastColumn: 0,
				wordWrap: "on",
				wrappingIndent: "same",
				wrappingStrategy: "advanced",
				scrollBeyondLastLine: false,
				"semanticHighlighting.enabled": true,
				renderLineHighlightOnlyWhenFocus: true,
				tabCompletion: "on",
				scrollbar: {
					alwaysConsumeMouseWheel: false,
					vertical: "auto",
					useShadows: false,
				},

				// scrollbar: { vertical: "auto", horizontal: "auto" },
				lineNumbers: "on",
				lineDecorationsWidth: 10,
				lineNumbersMinChars: 3,
				glyphMargin: true,
				folding: true,
				foldingStrategy: "auto",
				foldingHighlight: true,

				//renderLineHighlight: "all",
				renderWhitespace: "none",
				quickSuggestions: true,
				language,
			}}
			{...props}
		/>
	);
});

Editor.displayName = "Editor";

export default Editor;
