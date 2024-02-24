import PanelHandle from "@/components/panel-handle";
import { ThemeToggler } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useConfig } from "@/context/config/useConfig";
import { DbProvider } from "@/context/db/provider";
import { EditorProvider } from "@/context/editor/provider";
import { useEditor } from "@/context/editor/useEditor";
import { QueryProvider } from "@/context/query/provider";
import { useQuery } from "@/context/query/useQuery";
import { useFileDrop } from "@/context/session/hooks/useAddFile.tsx";
import { SessionProvider } from "@/context/session/provider";
import useBreakpoint from "@/hooks/use-breakpoints";
import { cn } from "@/lib/utils";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  createFileRoute,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Loader2, MenuIcon, PlayIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { Panel, PanelGroup } from "react-resizable-panels";
import { toast } from "sonner";
import { useSpinDelay } from "spin-delay";
import EditorPanel from "./-components/editor-panel";
import Settings from "./-components/settings";
import Sidepanel from "./-components/sidepanel";
import { PanelProvider } from "./-context/panel/provider";

export const Route = createFileRoute("/")({
  component: PlaygroundContainer,
  errorComponent: ErrorComponent,
  //errorComponent: (props)=><ErrorComponent {...props} />,
  // loader: async ({ abortController }) => {
  //   let worker: Worker | undefined;
  //   let getFilesFn: Remote<GetSessionWorker> | undefined;

  //   try {
  //     worker = new Worker(
  //       new URL("@/workers/get-session-worker.ts", import.meta.url),
  //       {
  //         type: "module",
  //         name: "GetSessionWorker",
  //       },
  //     );

  //     getFilesFn = wrap<GetSessionWorker>(worker);

  //     const resPromise = await getFilesFn("default");

  //     console.log("resPromise", resPromise);

  //     // abort worker if route is aborted
  //     abortController.signal.addEventListener("abort", () => {
  //       worker?.terminate();
  //     });

  //     const res = await resPromise;

  //     return res;
  //   } catch (e) {
  //     console.error("Error loading route: ", e);
  //     throw e;
  //   } finally {
  //     getFilesFn?.[releaseProxy]();
  //     worker?.terminate();
  //   }
  // },
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
        <PanelProvider>
          <QueryProvider>
            <EditorProvider>
              <Playground />
              <BrowserAlertBar />
            </EditorProvider>
          </QueryProvider>
        </PanelProvider>
      </DbProvider>
    </SessionProvider>
  );
}

function BrowserAlertBar() {
  const { browser } = useConfig();

  const isChrome = browser === "chrome";

  if (isChrome) return null;

  return (
    <Alert
      variant="destructive"
      className="absolute inset-x-0 top-4 z-50 mx-auto max-w-2xl bg-red-500  text-white shadow-md"
    >
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        QuackDB does not yet support your browser. Please use Chrome for the
        best experience.
      </AlertDescription>
    </Alert>
  );
}

function Playground() {
  const {
    isDragActive,
    ref,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onFileDrop,
  } = useFileDrop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // we read this during render so we can't use a ref.
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const toolbarEl = document.getElementById("toolbar-portal");

    if (toolbarEl) {
      setEl(toolbarEl);
    }

    return () => {
      setEl(null);
    };
  }, []);

  const isSmallerScreen = useBreakpoint("md");

  if (isSmallerScreen) {
    return (
      <>
        <div className="inline-flex h-16 w-full items-center justify-between px-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen((s) => !s)}
          >
            <MenuIcon className="size-5" />
          </Button>
          <div className="inline-flex items-center gap-2">
            <Toolbar />
            <Settings />
            <ThemeToggler />
          </div>
        </div>
        <PanelGroup
          className="rounded-none"
          direction="vertical"
          id="_mobile-layout-panel-group"
        >
          <EditorPanel />
        </PanelGroup>
        <MobileSidePanel
          isOpen={mobileMenuOpen}
          onOpenChange={(open) => setMobileMenuOpen(open)}
        >
          <Sidepanel />
        </MobileSidePanel>
      </>
    );
  }
  return (
    <div
      onDrop={onFileDrop}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      ref={ref}
      className={cn(
        "flex size-full bg-inherit",
        isDragActive &&
          "bg-gray-100 transition-colors duration-200 ease-in-out dark:bg-gray-800",
      )}
    >
      {/* Panel provider is custom context while PanelGroup is unrelated component; poor naming. */}

      <PanelGroup
        className="h-[calc(100vh-64px)] rounded-none"
        direction="horizontal"
        autoSaveId="_desktop-layout-panel-group"
      >
        <Panel
          collapsedSize={5}
          defaultSize={15}
          minSize={5}
          className="max-h-full"
        >
          <Sidepanel />
        </Panel>
        <PanelHandle />
        <Panel
          minSize={15}
          className="max-h-full max-w-full"
        >
          <EditorPanel />
        </Panel>
      </PanelGroup>
      {/* put into the top level toolbar */}
      {el &&
        createPortal(
          <div className="ml-auto flex w-full items-center space-x-2 sm:justify-end">
            {/* <PresetSelector presets={presets} /> */}
            <QueryMeta />

            <Toolbar />
            <Settings />

            {/* <SessionCombobox /> */}
          </div>,
          el,
        )}
    </div>
  );
}

function QueryMeta() {
  const { meta, status } = useQuery();

  const seconds = Math.floor(meta?.executionTime ?? 0) / 1000;
  const formattedTime = seconds.toFixed(2);

  if (status === "RUNNING") {
    return (
      <Badge
        variant="secondary"
        className="text-xs tabular-nums text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" />
      </Badge>
    );
  }

  return (
    <>
      <Badge
        variant="outline"
        className={cn(
          "border-green-300 bg-green-100 text-xs tabular-nums text-muted-foreground",
          meta?.cacheHit && "border-orange-300 bg-orange-100",
        )}
      >
        {meta?.cacheHit ? "cached" : "live"}{" "}
      </Badge>

      <Badge
        variant="outline"
        className="text-xs tabular-nums text-muted-foreground"
      >
        {formattedTime}s
      </Badge>
    </>
  );
}

function MobileSidePanel(props: {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { isOpen, onOpenChange } = props;
  return (
    <Sheet
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        forceMount
        side="right"
      >
        {props.children}
      </SheetContent>
    </Sheet>
  );
}

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

    // cleanup query to remove comments and empty lines
    const cleanedQuery = query
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    await onRunQuery(cleanedQuery);

    return () => {
      controller.abort();
    };
  }, [editorRef, onCancelQuery, onRunQuery]);

  useHotkeys(
    "mod+enter",
    () => {
      if (status === "RUNNING") {
        onCancelQuery("cancelled");
      } else {
        onRun();
      }
    },
    [status, onCancelQuery, onRun],
  );

  const isLoading = useSpinDelay(status === "RUNNING", {
    delay: 0,
    minDuration: 200,
  });

  if (isLoading) {
    return (
      <Button
        size="sm"
        onClick={() => onCancelQuery("cancelled")}
        className="h-7 w-20"
        variant="destructive"
      >
        Cancel
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
