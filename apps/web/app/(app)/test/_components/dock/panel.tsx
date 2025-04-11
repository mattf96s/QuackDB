"use client";

import {
	PanelProvider,
	usePanel,
} from "@/app/(app)/test/_components/dock/panel/context";
import type { Editor, Monaco } from "@/components/monaco/types";
import { Editor as EditorComp, type OnMount } from "@monaco-editor/react";
import type { IDockviewPanelProps } from "dockview";
import type { IDisposable } from "monaco-editor";
import { useCallback, useEffect, useRef } from "react";
import { useSpinDelay } from "spin-delay";

export function Panel(props: IDockviewPanelProps) {
	const { id } = props.api;
	return (
		<PanelProvider panelId={id}>
			<PanelContents {...props} />
		</PanelProvider>
	);
}

function PanelContents(props: IDockviewPanelProps) {
	const {
		state: { contents, error, loading },
	} = usePanel();

	const spinDelay = useSpinDelay(loading, {
		minDuration: 100,
	});

	return (
		<div className="h-full overflow-auto text-white relative">
			{spinDelay && (
				<span
					style={{
						fontSize: "24px",
						marginLeft: "10px",
					}}
				>
					Loading...
				</span>
			)}
			{!spinDelay && !error && <CodeEditor />}
		</div>
	);
}

function CodeEditor() {
	const { onSaveFile, state } = usePanel();
	// const [code, setCode] = useState(state.contents);
	const editorRef = useRef<Editor | null>(null);
	const monacoRef = useRef<Monaco | null>(null);

	const { contents } = state;

	const onMount: OnMount = useCallback(
		(editor, monaco) => {
			editorRef.current = editor;
			monacoRef.current = monaco;

			const model = editor.getModel();
			model?.setValue(contents);

			const disposables: IDisposable[] = [];

			disposables.push(
				editorRef.current.addAction({
					id: "save-file",
					label: "Save File",
					keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
					contextMenuGroupId: "navigation",
					contextMenuOrder: 1.5,
					run: (editor) => {
						const contents = editor.getValue();
						console.log("Saving file contents: ", contents);

						onSaveFile(contents);
					},
				}),
			);

			return () => {
				if (editorRef.current) {
					editorRef.current.dispose();
				}

				// Dispose of any other resources
				for (const disposable of disposables) {
					disposable.dispose();
				}
			};
		},
		[onSaveFile, contents],
	);

	useEffect(() => {
		if (!editorRef.current) return;
		const model = editorRef.current.getModel();
		if (!model) return;
		model.setValue(contents);
		const disposables: IDisposable[] = [];
		// disposables.push(
		//   model.onDidChangeContent(() => {
		//     const contents = editorRef.current?.getValue();
		//     console.log("Saving file contents: ", contents);
		//     onSaveFile(contents || "");
		//   }),
		// );
		return () => {
			for (const disposable of disposables) {
				disposable.dispose();
			}
		};
	}, [contents]);

	return (
		<EditorComp
			height="90vh"
			width="100%"
			defaultLanguage="sql"
			// defaultValue={code}
			theme="vs-dark"
			options={{
				automaticLayout: true,
				fontSize: 16,
				lineHeight: 24,
				minimap: {
					enabled: false,
				},
				scrollBeyondLastLine: false,
				wordWrap: "on",
				wrappingStrategy: "advanced",
				wrappingIndent: "indent",
				renderLineHighlight: "all",
				renderWhitespace: "all",
				renderControlCharacters: true,
				folding: true,
				foldingStrategy: "auto",
				lineNumbers: "on",
				lineNumbersMinChars: 3,
				lineDecorationsWidth: 10,
			}}
			// value={code}
			// onChange={(value) => {
			// 	startTransition(() => {
			// 		setCode(value || "");
			// 	});
			// }}
			onMount={onMount}
		/>
	);
}
