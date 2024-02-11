import { memo, Suspense, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { createFileRoute } from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import { toast } from "sonner";
import {
  CodeViewer,
  PresetSave,
  PresetSelector,
  PresetShare,
} from "@/components/playground";
import PresetActions from "@/components/playground/preset-action";
import { type Preset } from "@/components/playground/types";
import { Separator } from "@/components/ui/separator";
import { DbProvider } from "@/context/db/provider";
import { useDB } from "@/context/db/useDB";
import { SessionProvider } from "@/context/session/provider";
import { cn } from "@/lib/utils";
import type { GetSessionWorker } from "@/workers/get-session-worker";
import SessionCombobox from "./-components/session-selector";
import Sidepanel from "./-components/sidepanel";
import { PanelProvider } from "./-context/panel/provider";

const presets: Preset[] = [];

export const Route = createFileRoute("/")({
  component: PlaygroundContainer,
  loader: async ({ abortController }) => {
    let worker: Worker | undefined;
    let getFilesFn: Remote<GetSessionWorker> | undefined;

    try {
      worker = new Worker(
        new URL("@/workers/get-session-worker.ts", import.meta.url),
        {
          type: "module",
          name: "GetSessionWorker",
        },
      );

      getFilesFn = wrap<GetSessionWorker>(worker);

      const resPromise = getFilesFn("default");

      // abort worker if route is aborted
      abortController.signal.addEventListener("abort", () => {
        worker?.terminate();
      });

      const res = await resPromise;

      return res;
    } finally {
      getFilesFn?.[releaseProxy]();
      worker?.terminate();
    }
  },
});

function PlaygroundContainer() {
  return (
    <SessionProvider>
      <DbProvider>
        <DBInitializer>
          <Playground />
        </DBInitializer>
      </DbProvider>
    </SessionProvider>
  );
}

const DBInitializer = memo(function DBInitializer(props: {
  children: React.ReactNode;
}) {
  const { db } = useDB();

  const { datasets } = Route.useLoaderData();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    // initialize the db with the datasets
    const init = async () => {
      try {
        for (const dataset of datasets) {
          if (signal.aborted) return;
          const file = await dataset.handle.getFile();
          await db?.registerFileHandle(dataset.name, file);
        }
      } catch (e) {
        console.error("Error registering datasets: ", e);
        toast.error("Error registering datasets", {
          description: "You can try clicking the refresh sources button.",
        });
      }
    };

    console.log("Initializing DB with datasets");

    init();

    return () => {
      controller.abort();
    };
  }, [datasets, db]);

  return <Suspense fallback={<p>Loading...</p>}>{props.children}</Suspense>;
});

function Playground() {
  const data = Route.useLoaderData();

  return (
    <div className="h-full flex-col md:flex">
      <div className="container flex max-w-none flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <div>
          {/* <h2 className="text-lg font-semibold">QuackDB</h2> */}
          <SessionCombobox />
        </div>
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

      {/* Panel provider is custom context while PanelGroup is unrelated component; poor naming. */}
      <PanelProvider>
        <Suspense fallback={<p>Loading...</p>}>
          <div className="h-full">
            <PanelGroup
              className="rounded-md"
              direction="horizontal"
            >
              <Panel
                className="flex flex-col"
                collapsedSize={5}
                collapsible={true}
                defaultSize={15}
                maxSize={20}
                minSize={15}
              >
                <Sidepanel />
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
              <Panel
                className="flex flex-col"
                minSize={50}
              >
                <p>editor</p>
              </Panel>
            </PanelGroup>
          </div>
        </Suspense>
      </PanelProvider>

      {/* <Suspense fallback={<p>Loading...</p>}>
        <FilePanels files={storage?.tree ?? []} />
      </Suspense> */}
    </div>
  );
}
