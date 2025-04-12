"use client";

import { useEditorSettings } from "@/context/editor-settings/useEditor";
import { useEditor } from "@/context/editor/useEditor";
import { useSession } from "@/context/session/useSession";
import { useSqlFormatter } from "@/hooks/use-sql-formatter";
import { cn } from "@/lib/utils";
import type { OnChange } from "@monaco-editor/react";
import { GripHorizontal, Loader2 } from "lucide-react";
import * as monaco from "monaco-editor";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useSpinDelay } from "spin-delay";
import ResultsView from "../result-viewer";
import OpenFileTabs from "./components/open-files";

const MonacoEditor = dynamic(() => import("@/components/monaco"), {
	ssr: false,
});

self.MonacoEnvironment = {
	getWorker: function (workerId, label) {
		// @ts-expect-error copied verbatim
		const getWorkerModule = (moduleUrl, label) => {
			// @ts-expect-error copied verbatim
			return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl), {
				name: label,
				type: "module",
			});
		};

		switch (label) {
			case "json":
				return getWorkerModule(
					"/monaco-editor/esm/vs/language/json/json.worker?worker",
					label,
				);
			case "css":
			case "scss":
			case "less":
				return getWorkerModule(
					"/monaco-editor/esm/vs/language/css/css.worker?worker",
					label,
				);
			case "html":
			case "handlebars":
			case "razor":
				return getWorkerModule(
					"/monaco-editor/esm/vs/language/html/html.worker?worker",
					label,
				);
			case "typescript":
			case "javascript":
				return getWorkerModule(
					"/monaco-editor/esm/vs/language/typescript/ts.worker?worker",
					label,
				);
			default:
				return getWorkerModule(
					"/monaco-editor/esm/vs/editor/editor.worker?worker",
					label,
				);
		}
	},
};

// @ts-expect-error copied verbatim
monaco.editor.create(document.getElementById("container"), {
	value: "function hello() {\n\talert('Hello world!');\n}",
	language: "javascript",
});

function EditorPanel() {
	return (
		<PanelGroup className="flex size-full flex-col" direction="vertical">
			<Panel minSize={10} className="flex flex-col">
				<OpenFileTabs />
				<CurrentEditor />
			</Panel>

			<PanelResizeHandle
				className={cn(
					"relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
				)}
			>
				<div className="z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border">
					<GripHorizontal className="size-2.5" />
				</div>
			</PanelResizeHandle>
			<Panel minSize={10}>
				<ResultsView />
			</Panel>
		</PanelGroup>
	);
}

export default EditorPanel;

function CurrentEditor() {
	const { editors, onSaveEditor, dispatch } = useSession();
	const { editorRef } = useEditor();
	const [sql, setSql] = useState("");
	const [isReady, setIsReady] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const currentEditor = useMemo(
		() => editors.find((editor) => editor.isFocused),
		[editors],
	);

	const onFormat = useCallback(
		async (formatted: string) => {
			if (!editorRef.current) return;
			if (!currentEditor) return;
			const editor = editorRef.current.getEditor();
			const model = editor?.getModel();

			if (!model) return;

			setSql(formatted);

			let content: string = formatted;
			try {
				model.applyEdits([
					{
						range: new monaco.Range(
							0,
							0,
							model.getLineCount(),
							model.getLineMaxColumn(model.getLineCount()),
						),
						text: formatted,
					},
				]);

				// Push the formatted content to the undo stack (so that the user can undo the formatting if they want to)
				model.pushStackElement();

				content = formatted;
			} catch (e) {
				console.error(`Error formatting file: ${currentEditor?.path}: `, e);
			}

			try {
				await onSaveEditor({
					content,
					path: currentEditor.path,
				});
			} catch (e) {
				console.error(`Error saving file: ${currentEditor.path}: `, e);
			} finally {
				setIsSaving(false);
			}
		},
		[currentEditor, editorRef, onSaveEditor],
	);

	const { formatSql } = useSqlFormatter(onFormat);

	const { shouldFormat } = useEditorSettings();

	const path = currentEditor?.path;

	const onChangeHandler: OnChange = useCallback(
		(value, _ev) => {
			setSql(value ?? "");

			if (!dispatch || !path) return;

			dispatch({
				type: "UPDATE_EDITOR",
				payload: {
					path,
					content: value ?? "",
				},
			});
		},
		[dispatch, path],
	);

	// get content of current editor
	useEffect(() => {
		if (currentEditor) {
			setSql(currentEditor.content);
			setIsReady(true);
		}
	}, [currentEditor]);

	const onSave = useCallback(
		async (editor: monaco.editor.ICodeEditor) => {
			if (!currentEditor?.path) return;

			// check if the content has changed

			const content = editor.getValue();

			const model = editor.getModel();

			if (model == null) return;

			setIsSaving(true);

			// handle savings in the hook callback callback so we can use webworker (wasm import is not working with turbopack; probably need to add a loader. TODO: investigate)
			if (shouldFormat) {
				formatSql(content);
				return;
			}

			try {
				await onSaveEditor({
					content,
					path: currentEditor.path,
				});
			} catch (e) {
				console.error(`Error saving file: ${currentEditor.path}: `, e);
			} finally {
				setIsSaving(false);
			}
		},
		[currentEditor, onSaveEditor, shouldFormat, formatSql],
	);

	const showLoader = useSpinDelay(isSaving, {
		delay: 0,
		minDuration: 120,
	});

	if (!currentEditor) {
		return (
			<div className="flex h-full items-center justify-center text-gray-400">
				No file selected
			</div>
		);
	}

	if (!isReady) {
		return (
			<div className="flex h-full items-center justify-center text-gray-400">
				Loading...
			</div>
		);
	}

	return (
		<>
			<MonacoEditor
				onSave={onSave}
				value={sql}
				ref={editorRef}
				onChange={onChangeHandler}
				className="h-full border-t-0"
				options={{
					padding: {
						top: 10,
						bottom: 16,
					},
				}}
			/>
			{showLoader && (
				<div className="absolute right-4 top-2 z-10">
					<Loader2
						name="loader-circle"
						className="size-4 animate-spin text-primary"
					/>
				</div>
			)}
		</>
	);
}
