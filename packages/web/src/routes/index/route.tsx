import { memo, Suspense, useCallback, useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Panel, PanelGroup } from "react-resizable-panels";
import {
  createFileRoute,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import { Loader2, PlayIcon, TerminalIcon } from "lucide-react";
import { toast } from "sonner";
import { useSpinDelay } from "spin-delay";
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
import Settings from "./-components/settings";
import Sidepanel from "./-components/sidepanel";
import { PanelProvider } from "./-context/panel/provider";

export const Route = createFileRoute("/")({
  component: PlaygroundContainer,
  errorComponent: ErrorComponent,
  //errorComponent: (props)=><ErrorComponent {...props} />,
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
  headers: () => {
    // add headers to allow shared array buffer and cors
    return {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "same-site",
    };
  },
});

function ErrorComponent(props: ErrorComponentProps) {
  const error = props.error;
  return (
    <div className="text-center">
      <p className="text-base font-semibold text-indigo-600"></p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-6 text-base leading-7 text-gray-600">
        {`Sorry, we couldn't find the page you're looking for.`}
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="#"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go back home
        </a>
        <a
          href="#"
          className="text-sm font-semibold text-gray-900"
        >
          Contact support <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}

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
        <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
          {/* <PresetSelector presets={presets} /> */}

          <Toolbar />
          <Settings />

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
  const onRun = useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    const editor = editorRef.current?.getEditor();
    if (!editor) {
      toast.warning("Editor not ready yet", {
        description: "Please wait a moment and try again.",
      });
      return;
    }

    const query = editor?.getModel()?.getValue();

    if (!query) {
      toast.warning("No query to run", {
        description: "Please write a query and try again.",
      });
      return;
    }

    signal.addEventListener("abort", () => {
      onCancelQuery("cancelled");
      toast.info("Query cancelled", {
        description: "The query was cancelled.",
      });
    });

    onRunQuery(query);

    return () => {
      controller.abort();
    };
  }, [editorRef, onCancelQuery, onRunQuery]);

  useHotkeys(
    "mod+enter",
    () => {
      if (status === "loading") {
        onCancelQuery("cancelled");
      } else {
        onRun();
      }
    },
    [status, onCancelQuery, onRun],
  );

  const isLoading = useSpinDelay(status === "loading", {
    delay: 0,
    minDuration: 200,
  });

  const isError = status === "error";

  if (isLoading) {
    return (
      <Button
        onClick={() => onCancelQuery("cancelled")}
        className="h-7 w-20"
        variant="destructive"
      >
        Cancel
        <Loader2 className="ml-2 size-4 animate-spin" />
      </Button>
    );
  }

  if (isError) {
    return (
      <Button
        onClick={onRun}
        className="h-7 w-20"
      >
        Retry
      </Button>
    );
  }

  return (
    <Button
      onClick={onRun}
      variant="success"
      size="sm"
      className="h-7 w-20"
    >
      Run
      <PlayIcon className="ml-2 size-4" />
    </Button>
  );
}
