"use client";

import { Button } from "@/components/ui/button";
import { useSqlFormatter } from "@/hooks/use-sql-formatter";
import type { OnMount } from "@monaco-editor/react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useRef } from "react";

const EditorComp = dynamic(() => import("@monaco-editor/react"), {
	ssr: false,
});

type Editor = Parameters<OnMount>["0"];
type Monaco = Parameters<OnMount>["1"];

export function CodeEditor() {
	const [input, setInput] = useState("SELCT * FROM users;");
	const editorRef = useRef<Editor | null>(null);
	const monacoRef = useRef<Monaco | null>(null);

	const onFormat = useCallback((formatted: string) => {
		console.log("Formatted SQL: ", formatted);
		setInput(formatted);
	}, []);

	const { formatSql } = useSqlFormatter(onFormat);

	const onSave = () => {
		console.log("onSave", input);
		formatSql(input);
	};

	return (
		<div>
			<EditorComp
				height="90vh"
				width="100%"
				defaultLanguage="sql"
				defaultValue={input}
				theme="vs-dark"
				onMount={(editor, monaco) => {
					editorRef.current = editor;
					monacoRef.current = monaco;
				}}
				onChange={(value) => {
					setInput(value || "");
				}}
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
			/>
			<div className="flex justify-end mt-2">
				<Button type="button" onClick={onSave}>
					Save
				</Button>
			</div>
		</div>
	);
}
