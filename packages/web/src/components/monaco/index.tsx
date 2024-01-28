import MonacoEditor, {type  EditorProps as MonacoEditorProps,type  OnMount } from "@monaco-editor/react";
import  { type editor , KeyMod, KeyCode } from 'monaco-editor'
import { forwardRef, useImperativeHandle, useRef } from "react";
type EditorProps = Exclude<MonacoEditorProps, 'value'> & { value: string };

type ForwardedRef = {
    getEditor: () => editor.IStandaloneCodeEditor | null

}

const Editor = forwardRef<ForwardedRef, EditorProps>((props, ref) => {

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
        editorRef.current.addAction({
            id: "runDuckDBQuery",
            label: "Run SQL Query",
            keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
            run: () => {
                console.log("Run SQL Query")
            },
        })
    }

    useImperativeHandle(ref, () => {
        return {
            getEditor() {
                return editorRef.current
            }
        }
    }, [])


    return (
        <MonacoEditor
            onMount={handleEditorDidMount}
            height="100px"
            language="sql"
            theme="vs-dark"
            options={{
                inlineSuggest: {
                    enabled: true,
                },
                fontSize: 16,
                formatOnType: true,
                autoClosingBrackets: 'always',
                automaticLayout: true,
                lineDecorationsWidth: 15,
                lineNumbersMinChars: 2,
                scrollbar: { alwaysConsumeMouseWheel: false },
                folding: false,
                scrollBeyondLastLine: false,
                minimap: {
                    enabled: false
                },
                lightbulb: {
                    enabled: true
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
                matchBrackets: 'always' as const,
                ...{ ...props.options }

            }}
            {...props}
        />
    );
})

export default Editor