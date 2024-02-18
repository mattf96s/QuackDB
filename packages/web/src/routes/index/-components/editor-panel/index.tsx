import { memo, Suspense, useCallback, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { AlertOctagon } from "lucide-react";
import Editor from "@/components/monaco";
import { useTheme } from "@/components/theme-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEditor } from "@/context/editor/useEditor";
import { useQuery } from "@/context/query/useQuery";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";
import { usePanel } from "../../-context/panel/usePanel";
import OpenFileTabs from "./components/open-files";
import ResultsView from "./components/results-viewer";

const EditorPanel = memo(function EditorPanel() {
  const { editors } = useSession();

  const { status, error } = useQuery();
  const { editorRef } = useEditor();

  const [sql, setSql] = useState(
    `SELECT * FROM READ_PARQUET('stores.parquet');`,
  );

  const { currentFile } = usePanel();

  const onSave = useCallback((value: string) => {
    console.log("on save: ", value);
  }, []);

  const currentEditor = editors.find((editor) => editor.isFocused);

  return (
    <PanelGroup
      className="flex flex-col"
      direction="vertical"
    >
      <Panel className="relative flex flex-col">
        <OpenFileTabs />
        {currentEditor ? (
          <Editor
            onSave={onSave}
            value={sql}
            ref={editorRef}
            onChange={(value) => setSql(value ?? "")}
            className="h-full border-t-0"
            options={{
              padding: {
                top: 16,
                bottom: 16,
              },
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            No file selected
          </div>
        )}
        {/* code actions */}
        <div className="absolute bottom-3 left-0 right-10 z-10 w-full px-4">
          <div className="mx-auto max-w-fit">
            {status === "error" && (
              <ErrorNotification error={error ?? "Unknown error"} />
            )}
          </div>
        </div>
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
      <Panel>
        <Suspense fallback={<p>Loading...</p>}>
          <ResultsView />
        </Suspense>
      </Panel>
    </PanelGroup>
  );
});

export default EditorPanel;

function ErrorNotification(props: { error: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Alert
      variant={isDark ? "default" : "destructive"}
      className="space-y-1 font-mono"
    >
      <AlertTitle>
        <span className="inline-flex items-center gap-2">
          <AlertOctagon className="size-4" />
          Error:
        </span>
      </AlertTitle>
      <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
        {props.error}
      </AlertDescription>
    </Alert>
  );
}
