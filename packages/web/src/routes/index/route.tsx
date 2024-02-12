import { memo, Suspense, useCallback, useEffect } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";
import { createFileRoute } from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import { Loader2, TerminalIcon } from "lucide-react";
import { toast } from "sonner";
import PanelHandle from "@/components/panel-handle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DbProvider } from "@/context/db/provider";
import { useDB } from "@/context/db/useDB";
import { EditorProvider } from "@/context/editor/provider";
import { useEditor } from "@/context/editor/useEditor";
import { QueryProvider } from "@/context/query/provider";
import { useQuery } from "@/context/query/useQuery";
import { SessionProvider } from "@/context/session/provider";
import type { GetSessionWorker } from "@/workers/get-session-worker";
import EditorPanel from "./-components/editor-panel";
import Sidepanel from "./-components/sidepanel";
import { PanelProvider } from "./-context/panel/provider";

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
          <PanelProvider>
            <QueryProvider>
              <EditorProvider>
                <Playground />
              </EditorProvider>
            </QueryProvider>
          </PanelProvider>
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
          if (signal.aborted) {
            break;
          }
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

const Playground = memo(function Playground() {
  return (
    <div className="h-full flex-col md:flex">
      <div className="container flex max-w-none flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
        <div className="flex items-center justify-evenly gap-2">
          <h2 className="text-lg font-semibold">QuackDB</h2>
          <TerminalIcon className="size-5" />
        </div>
        <div className="ml-auto flex w-full space-x-2 sm:justify-end">
          {/* <PresetSelector presets={presets} /> */}

          <div className="hidden space-x-2 md:flex">
            <Toolbar />
          </div>

          {/* <SessionCombobox /> */}
        </div>
      </div>
      <Separator />

      {/* Panel provider is custom context while PanelGroup is unrelated component; poor naming. */}

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
            <PanelHandle />
            <Panel
              className="flex flex-col"
              minSize={50}
            >
              <EditorPanel />
            </Panel>
          </PanelGroup>
        </div>
      </Suspense>
    </div>
  );
});

function Toolbar() {
  const { status, onCancelQuery, onRunQuery } = useQuery();
  const { editorRef } = useEditor();

  // run the whole file contents rather than the selected text;
  // Don't wait;
  const onRun = useCallback(() => {
    const editor = editorRef.current?.getEditor();
    if (!editor) return;

    const query = editor?.getModel()?.getValue();

    console.log("Running query: ", query);

    if (!query) return;

    onRunQuery(query);
  }, [editorRef, onRunQuery]);

  // shortcut to run / cancel query
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.ctrlKey) {
        onRun();
      }
      if (e.key === "Escape") {
        onCancelQuery("cancelled");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onCancelQuery, onRun]);
  return (
    <>
      {status === "loading" && (
        <Button
          onClick={() => onCancelQuery("cancelled")}
          className="h-7"
          variant="destructive"
        >
          Cancel
          <Loader2 className="ml-2 size-4 animate-spin" />
        </Button>
      )}
      {status === "idle" && (
        <Button
          onClick={onRun}
          className="h-7"
        >
          Run
        </Button>
      )}
      {status === "error" && (
        <Button
          onClick={onRun}
          className="h-7"
        >
          Retry
        </Button>
      )}
    </>
  );
}
