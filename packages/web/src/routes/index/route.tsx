import { createFileRoute } from "@tanstack/react-router";
import { wrap } from "comlink";
import {
  CodeViewer,
  PresetSave,
  PresetSelector,
  PresetShare,
} from "@/components/playground";
import PresetActions from "@/components/playground/preset-action";
import { type Preset } from "@/components/playground/types";
import { Separator } from "@/components/ui/separator";
import type { GetDirectoryFilesWorker } from "@/workers/get-directory-files";
import { DBProvider } from "./-components/-db-context";
import FilePanels from "./-components/panels/index.lazy";

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
  return (
    <DBProvider>
      <div className="h-full flex-col md:flex">
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
      </div>
    </DBProvider>
  );
}
