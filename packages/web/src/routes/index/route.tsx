import { memo, Suspense, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { Panel, PanelGroup } from "react-resizable-panels";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  createFileRoute,
  type ErrorComponentProps,
  useRouter,
} from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import { Loader2, PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { useSpinDelay } from "spin-delay";
import PanelHandle from "@/components/panel-handle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
  const error = props.error;

  const msg = error instanceof Error ? error.message : "Unknown error";
  return (
    <div className="flex flex-col gap-10">
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{msg}</AlertDescription>
      </Alert>
      <div>
        <Button
          onClick={() => {
            router.cleanCache();
            router.invalidate();
          }}
        >
          Reload
        </Button>
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
  // we read this during render so we can't use a ref.
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const toolbarEl = document.getElementById("toolbar-portal");
    console.log("toolbarEl", toolbarEl);
    if (toolbarEl) {
      setEl(toolbarEl);
    }
  }, []);
  return (
    <>
      {/* put into the top level toolbar */}
      {el &&
        createPortal(
          <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
            {/* <PresetSelector presets={presets} /> */}

            <Toolbar />
            <Settings />

            {/* <SessionCombobox /> */}
          </div>,
          el,
        )}

      <div className="relative">
        <div className="fixed bottom-0 left-16 right-0 top-[64px] flex flex-col">
          {/* Panel provider is custom context while PanelGroup is unrelated component; poor naming. */}

          <Suspense fallback={<p>Loading...</p>}>
            <PanelGroup
              className="rounded-none"
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
          </Suspense>
        </div>
      </div>
    </>
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
