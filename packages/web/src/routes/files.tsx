import { useState } from "react";
import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useMediaQuery } from "@uidotdev/usehooks";
import { wrap } from "comlink";
import { useSpinDelay } from "spin-delay";
import FileListItem from "@/components/files/components/list-item";
import { Button } from "@/components/ui/button/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizeable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { AddFilesHandlesWorker } from "@/workers/add-files-worker";
import type { GetDirectoryFilesWorker } from "@/workers/get-directory-files";

export const Route = createFileRoute("/files")({
  component: FileExplorer,
  loader: async () => {
    const worker = new Worker(
      new URL("@/workers/get-directory-files.ts", import.meta.url).href,
      {
        type: "module",
      },
    );
    const getFilesFn = wrap<GetDirectoryFilesWorker>(worker);

    const res = await getFilesFn();

    worker.terminate();

    return res;
  },
});

function FileExplorer() {
  return (
    <div className="hidden h-full flex-col md:flex">
      <Header />
      <Separator />
      <FileTree />
    </div>
  );
}

function Header() {
  const [isLoading, setIsLoading] = useState(false);
  const onAddFilesHandler = async () => {
    let worker: Worker | undefined;
    try {
      const fileHandles = await window.showOpenFilePicker({
        types: [
          {
            description: "Datasets",
            accept: {
              "application/octet-stream": [".parquet"],
              "csv/*": [".csv"],
              "json/*": [".json"],
              "text/*": [".txt"],
              "application/vnd.ms-excel": [".xls"],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
            },
          },
        ],
        excludeAcceptAllOption: false,
        multiple: true,
      });

      if (fileHandles.length === 0) return;

      setIsLoading(true);

      worker = new Worker(
        new URL("@/workers/add-files-worker.ts", import.meta.url).href,
        {
          type: "module",
        },
      );

      const fn = wrap<AddFilesHandlesWorker>(worker);
      await fn(fileHandles);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // User cancelled
      console.error("Error in onAddFilesHandler: ", e);
    } finally {
      setIsLoading(false);
      worker?.terminate();
    }
  };

  const showDisabledState = useSpinDelay(isLoading, {
    delay: 500,
  });

  return (
    <div className="container flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
      <h2 className="text-lg font-semibold">Files</h2>
      <div className="ml-auto flex w-full space-x-2 sm:justify-end">
        <Button
          disabled={showDisabledState}
          onClick={onAddFilesHandler}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function FileTree() {
  return (
    <>
      <TooltipProvider delayDuration={0}>
        <ResizeableGroupContainer />
      </TooltipProvider>
    </>
  );
}

const defaultDesktopLayout = [30, 70];

/**
 * Ensure it is client side only so we can use matchMedia.
 */
function ResizeableGroupContainer() {
  const [defaultLayout, _setDefaultLayout] = useState<number[]>([
    ...defaultDesktopLayout,
  ]);
  const isSmallerScreen = useMediaQuery("(max-width: 640px)");

  if (isSmallerScreen) {
    return (
      <ResizablePanelGroup
        className="min-h-[calc(100vh-64px)]"
        direction="vertical"
      >
        <ResizablePanel maxSize={75}>
          <Outlet />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          className="max-h-[500px] overflow-y-auto"
          maxSize={75}
        >
          <ScrollArea className="h-[500px]">
            <TreeViewWrapper />
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }

  return (
    <ResizablePanelGroup
      direction={isSmallerScreen ? "vertical" : "horizontal"}
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(
          sizes,
        )}`;
      }}
      className="h-full max-h-[calc(100vh-64px)] items-stretch" // 64px offset is the height of the header. NB for smooth scrolling with the virtualizer.
    >
      <ResizablePanel
        defaultSize={defaultLayout[0]}
        minSize={30}
      >
        <TreeView />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={defaultLayout[1]}>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function TreeViewWrapper() {
  const isPending = useRouterState({ select: (s) => s.status === "pending" });

  if (isPending) {
    return <div>Loading...</div>;
  }

  return <TreeView />;
}

function TreeView() {
  const files = Route.useLoaderData();

  return (
    <ScrollArea className="flex h-[calc(100vh-64px)] flex-col py-4">
      {files?.tree.map((node) => (
        <FileListItem
          key={node.id}
          node={node}
        />
      ))}
    </ScrollArea>
  );
}
