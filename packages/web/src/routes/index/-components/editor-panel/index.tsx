import { memo, Suspense, useCallback, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { AlertOctagon } from "lucide-react";
import Editor from "@/components/monaco";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEditor } from "@/context/editor/useEditor";
import { useQuery } from "@/context/query/useQuery";
import { cn } from "@/lib/utils";
import { usePanel } from "../../-context/panel/usePanel";
import OpenFileTabs from "./components/open-files";
import ResultsView from "./components/results-viewer";

const defaultSQL = `
  -- Query external JSON API and create a new table
  CREATE TABLE new_tbl AS SELECT * FROM read_json_auto('https://api.datamuse.com/words?ml=sql');
  SELECT * FROM new_tbl;

  -- Query a parquet file
  SELECT * FROM read_parquet('stores.parquet');

  -- Query a CSV file
  SELECT * FROM read_csv('stores.csv');
`;

const EditorPanel = memo(function EditorPanel() {
  const { status, error } = useQuery();
  const { editorRef } = useEditor();

  const [sql, setSql] = useState(
    `SELECT * FROM READ_PARQUET('stores.parquet');`,
  );

  const { currentFile } = usePanel();

  const onSave = useCallback((value: string) => {
    console.log("on save: ", value);
  }, []);

  return (
    <PanelGroup
      className="flex flex-col"
      direction="vertical"
    >
      <Panel className="relative flex flex-col">
        <OpenFileTabs />
        {currentFile ? (
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
        <div className="absolute -inset-x-2 bottom-3 flex w-full items-center gap-2 px-4">
          <div className="flex flex-grow items-center justify-between gap-4 px-4">
            {status === "error" && (
              <Alert
                variant="destructive"
                className="space-y-1 font-mono"
              >
                <AlertTitle>
                  <span className="inline-flex items-center gap-2">
                    <AlertOctagon className="size-4" />
                    Error:
                  </span>
                </AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
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
