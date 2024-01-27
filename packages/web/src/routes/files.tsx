import { FileTreeDropContainer } from "@/components/files";
import FileListItem from "@/components/files/components/list-item";
import { FileTreeProvider, useFileTree } from "@/components/files/context";
import { useAddFilesHandler } from "@/components/files/hooks/useOnAddFile";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizeable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";
import { useSpinDelay } from "spin-delay";

export const Route = createFileRoute("/files")({
  component: FileExplorer,
});

function FileExplorer() {
  return (
    <FileTreeProvider>
      <div className="hidden h-full flex-col md:flex">
        <Header />
        <Separator />
        <FileTree />
      </div>
    </FileTreeProvider>
  );
}

function Header() {
  const { onAddFilesHandler, isLoading } = useAddFilesHandler();

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
    <FileTreeDropContainer>
      <TooltipProvider delayDuration={0}>
        <ResizeableGroupContainer />
      </TooltipProvider>
    </FileTreeDropContainer>
  );
}

const defaultDesktopLayout = [30, 70];

/**
 * Ensure it is client side only so we can use matchMedia.
 */
function ResizeableGroupContainer() {
  const [defaultLayout, setDefaultLayout] = useState<number[]>([
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
            <TreeView />
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

function TreeView() {
  const { state, onRefreshFileTree } = useFileTree();

  useEffect(() => {
    onRefreshFileTree();
  }, []);

  return (
    <ScrollArea className="flex h-[calc(100vh-64px)] flex-col py-4">
      {state.tree.map((node) => (
        <FileListItem
          key={node.id}
          node={node}
        />
      ))}
    </ScrollArea>
  );
}
