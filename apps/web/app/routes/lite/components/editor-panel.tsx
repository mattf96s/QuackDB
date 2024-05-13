import Editor, { type Monaco } from "@monaco-editor/react";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { type editor } from "monaco-editor";

import { Suspense, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "~/lib/utils";

function EditorPanel() {
  return (
    <PanelGroup
      className="flex size-full flex-col"
      direction="vertical"
    >
      <Panel
        minSize={10}
        className="flex flex-col"
      >
        <CurrentEditor />
      </Panel>

      <PanelResizeHandle
        className={cn(
          "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        )}
      >
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
          <DragHandleDots2Icon className="size-2.5" />
        </div>
      </PanelResizeHandle>
      <Panel minSize={10}>
        <p>results</p>
      </Panel>
    </PanelGroup>
  );
}

export default EditorPanel;

function CurrentEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  function handleEditorDidMount(
    editor: editor.IStandaloneCodeEditor,
    _monaco: Monaco,
  ) {
    // here is the editor instance
    // you can store it in `useRef` for further usage
    editorRef.current = editor;
  }

  return (
    <Suspense>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        onMount={handleEditorDidMount}
        loading={
          <div className="absolute right-4 top-2 z-10">
            <Loader2
              name="loader-circle"
              className="size-4 animate-spin text-primary"
            />
          </div>
        }
      />
    </Suspense>
  );
}
