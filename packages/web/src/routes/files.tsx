import { useState } from "react";
import {
  createFileRoute,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useMediaQuery } from "@uidotdev/usehooks";
import { wrap } from "comlink";
import { Plus, Trash2Icon } from "lucide-react";
import { useSpinDelay } from "spin-delay";
import FileListItem from "@/components/files/components/list-item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizeable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import useAddFiles from "@/hooks/use-add-files";
import useReset from "@/hooks/use-reset";
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
  const { isLoading, onAddFilesHandler } = useAddFiles();

  const showDisabledState = useSpinDelay(isLoading, {
    delay: 500,
  });

  return (
    <div className="container flex max-w-none flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
      <h2 className="text-lg font-semibold">Files</h2>
      <div className="ml-auto flex w-full space-x-2 sm:justify-end">
        <ResetButton />
        <Button
          disabled={showDisabledState}
          onClick={onAddFilesHandler}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ResetButton() {
  const { isLoading, onResetFilesHandler } = useReset();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          disabled={isLoading}
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all files?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will clear all your local files
            from QuackDB.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onResetFilesHandler}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FileTree() {
  return (
    <TooltipProvider delayDuration={0}>
      <ResizeableGroupContainer />
    </TooltipProvider>
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
        minSize={20}
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
