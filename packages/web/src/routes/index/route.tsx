import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { wrap } from "comlink";
import Editor from "@/components/monaco";
import {
  CodeViewer,
  PresetSave,
  PresetSelector,
  PresetShare,
} from "@/components/playground";
import PresetActions from "@/components/playground/preset-action";
import { type Preset } from "@/components/playground/types";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizeable";
import { Separator } from "@/components/ui/separator";
import type { GetDirectoryFilesWorker } from "@/workers/get-directory-files";
import EntityList from "./-components/entity-list";
import FilePanels from "./-components/panels";

const presets: Preset[] = [];

export const Route = createFileRoute("/")({
  component: Playground,
  loader: async () => {
    const worker = new Worker(
      new URL("@/workers/get-directory-files.ts", import.meta.url),
      {
        type: "module",
        name: "GetDirectoryFilesWorker",
      },
    );
    const getFilesFn = wrap<GetDirectoryFilesWorker>(worker);

    const res = await getFilesFn();

    worker.terminate();

    return res;
  },
});

function Playground() {
  const data = Route.useLoaderData();
  const [showResizePanels] = useState(false);
  const [sql, setSql] = useState(`SELECT * FROM READ_PARQUET('tbl');`);
  return (
    <div className="hidden h-full flex-col md:flex">
      <div className="container flex max-w-none flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <h2 className="text-lg font-semibold">Playground</h2>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end">
          <PresetSelector presets={presets} />
          <PresetSave />
          <div className="hidden space-x-2 md:flex">
            <CodeViewer />
            <PresetShare />
          </div>
          <PresetActions />
        </div>
      </div>
      <Separator />

      <FilePanels files={data?.tree ?? []} />

      {showResizePanels && (
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout=${JSON.stringify(
              sizes,
            )}`;
          }}
          className="h-full max-h-[calc(100vh-64px)] items-stretch" // 64px offset is the height of the header. NB for smooth scrolling with the virtualizer.
        >
          <ResizablePanel
            defaultSize={20}
            minSize={5}
          >
            <EntityList files={data?.tree ?? []} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <Editor
              language="pgsql"
              value={sql}
              onChange={(value) => setSql(value ?? "")}
              className="min-h-[400px] flex-1 p-4 md:min-h-[700px] lg:min-h-[700px]"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      )}
    </div>
  );
}
