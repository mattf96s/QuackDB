import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { useLoaderData, useRouter } from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import { ChevronDown, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";
import { usePanel } from "@/routes/index/-context/panel/usePanel";
import type { AddEditorFileWorker } from "@/workers/add-editor-file-worker";

export default function EditorSources() {
  const { editors } = useLoaderData({ from: "/" });
  const { openFile } = usePanel();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const onCollapse = () => {
    setIsCollapsed(true);
  };

  const onExpand = () => {
    setIsCollapsed(false);
  };

  return (
    <div className="flex w-full flex-col pt-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex grow">
          <Button
            onClick={isCollapsed ? onExpand : onCollapse}
            variant="ghost"
            className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
          >
            <ChevronDown
              className={cn(
                "size-5",
                isCollapsed && "rotate-180 transition-transform",
              )}
            />
            <span className="text-sm font-semibold">Editor</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <SourcesToolbar />
        </div>
      </div>
      <div
        className={cn(
          "flex w-full flex-col gap-1 py-1",
          isCollapsed && "hidden",
        )}
      >
        {editors.map((editor) => {
          return (
            <ContextMenu key={editor.name}>
              <ContextMenuTrigger className="data-[state=open]:bg-gray-100">
                <Button
                  className="ml-5 flex h-6 w-48 items-center justify-start gap-2 p-2 pl-0"
                  variant="ghost"
                  onClick={() => openFile(editor)}
                >
                  <Pencil2Icon className="size-4" />
                  <span className="truncate font-normal">{editor.name}</span>
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem inset>
                  Open
                  <ContextMenuShortcut>⌘O</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem inset>
                  Rename
                  <ContextMenuShortcut>⌘R</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem inset>
                  Delete
                  <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
}

const useAddEditorFileWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const wrapperRef = useRef<Remote<AddEditorFileWorker> | null>(null);
  // set to promise so we can await it
  const [initPromise, setInitPromise] = useState(new Promise(() => {}));

  const { session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const w = new Worker(
      new URL("@/workers/add-editor-file-worker.ts", import.meta.url),
      {
        name: "add-editor-file-worker",
        type: "module",
      },
    );

    workerRef.current = w;

    const fn: Remote<AddEditorFileWorker> = wrap<AddEditorFileWorker>(w);

    wrapperRef.current = fn;

    signal.addEventListener("abort", () => {
      fn[releaseProxy]();
      w.terminate();

      workerRef.current = null;
      wrapperRef.current = null;

      setInitPromise(new Promise(() => {}));
    });

    setInitPromise(Promise.resolve());

    return () => {
      controller.abort();
    };
  }, []);

  const onAddEditorFileWorkerFn = useCallback(async () => {
    await initPromise;

    if (!wrapperRef.current) {
      throw new Error("Worker not initialized");
    }

    try {
      await wrapperRef.current({
        session,
      });

      router.invalidate();
    } catch (e) {
      console.error("Error adding new editor file: ", e);
      toast.error("Error opening file", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }, [initPromise, router, session]);

  return { onAddEditorFileWorkerFn };
};

/**
 * Manage datasets.
 *
 * #TODO: remote sources.
 *
 * @component
 */
function SourcesToolbar() {
  const router = useRouter();

  const { onAddEditorFileWorkerFn } = useAddEditorFileWorker();

  const onAddEditorFile = useCallback(async () => {
    try {
      await onAddEditorFileWorkerFn();
      router.invalidate();
    } catch (e) {
      // ignore aborted request
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Failed to add filehandles: ", e);
      toast.error("Failed to add files", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }, [onAddEditorFileWorkerFn, router]);

  const onRefresh = () => {
    router.invalidate();
  };

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        onClick={onAddEditorFile}
      >
        <Plus size={16} />
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={onRefresh}
      >
        <RefreshCw size={16} />
      </Button>
    </>
  );
}
