import { useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData, useRouter } from "@tanstack/react-router";
import { releaseProxy, type Remote, wrap } from "comlink";
import {
  ChevronDown,
  CopyCheck,
  Database,
  Plus,
  RefreshCw,
} from "lucide-react";
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
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { AddDatasetWorker } from "@/workers/add-dataset-worker";

const useSources = () => {
  const { datasets } = useLoaderData({ from: "/" });

  return datasets;
};

export default function DataSources() {
  const { sources } = useSession();

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
            <span className="text-sm font-semibold">Source</span>
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
        {sources.map((source) => (
          <DatesetItem
            key={source.path}
            {...source}
          />
        ))}
      </div>
    </div>
  );
}

type SourceEntry = ReturnType<typeof useSession>["sources"][number];

function DatesetItem(props: SourceEntry) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const { ext, handle, kind, mimeType, path } = props;

  const onCopy = async () => {
    let snippet = "";

    switch (mimeType) {
      case "application/json": {
        snippet = `CREATE OR REPLACE TABLE ${path} AS SELECT * FROM read_json_auto('${path}')`;
        break;
      }
      case "application/parquet": {
        snippet = `CREATE OR REPLACE VIEW '${path}' AS SELECT * FROM read_parquet('${path}')`;
        break;
      }
      case "text/csv": {
        snippet = `CREATE OR REPLACE TABLE ${path} AS SELECT * FROM read_csv_auto('${path}')`;
        break;
      }
      default: {
        toast.error(`Unknown file type: ${path}`, {
          description: "More file types will be supported soon.",
        });
        return;
      }
    }

    await copyToClipboard(snippet);
  };
  return (
    <ContextMenu key={path}>
      <ContextMenuTrigger className="data-[state=open]:bg-gray-100">
        <Button
          className="relative ml-5 flex h-6 w-48 items-center justify-start gap-2 p-2 pl-0"
          variant="ghost"
          onClick={onCopy}
        >
          <Database className="size-4" />
          <span className="truncate font-normal">{path}</span>
          {isCopied && (
            <span className="absolute inset-y-0 right-0">
              <CopyCheck
                size={16}
                className="bg-white text-green-700 shadow-sm"
              />
            </span>
          )}
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
}

const useAddDatasetWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const wrapperRef = useRef<Remote<AddDatasetWorker> | null>(null);
  // set to promise so we can await it
  const [initPromise, setInitPromise] = useState(new Promise(() => {}));

  const { sessionId } = useSession();
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const w = new Worker(
      new URL("@/workers/add-dataset-worker.ts", import.meta.url),
      {
        name: "add-dataset-worker",
        type: "module",
      },
    );

    workerRef.current = w;

    const fn: Remote<AddDatasetWorker> = wrap<AddDatasetWorker>(w);

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

  const onAddDatasetWorkerFn = useCallback(
    async (fileHandles: FileSystemFileHandle[]) => {
      await initPromise;

      if (!wrapperRef.current) {
        throw new Error("Worker not initialized");
      }

      const handles = fileHandles.map((fileHandle) => {
        return {
          fileHandle,
          filename: fileHandle.name,
        };
      });

      try {
        const { error } = await wrapperRef.current({
          handles,
          session: sessionId,
        });

        if (error) {
          throw new Error(error);
        }

        router.invalidate();
      } catch (e) {
        console.error("Error adding dataset: ", e);
        toast.error("Error adding datasets", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    },
    [initPromise, router, sessionId],
  );

  return { onAddDatasetWorkerFn };
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

  const { onAddDatasetWorkerFn } = useAddDatasetWorker();

  const onAddDataset = useCallback(async () => {
    const hasShowPicker = "showOpenFilePicker" in window;

    if (!hasShowPicker) {
      console.error("File picker not supported");

      toast.error("File picker not supported", {
        description: "File picker not supported on this browser",
      });

      return;
    }

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
              "text/plain": [".sql"],
            },
          },
        ],
        excludeAcceptAllOption: false,
        multiple: true,
      });

      if (!fileHandles || fileHandles.length === 0) return;

      await onAddDatasetWorkerFn(fileHandles);
    } catch (e) {
      // ignore aborted request
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Failed to add filehandles: ", e);
      toast.error("Failed to add files", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }, [onAddDatasetWorkerFn]);

  const onRefresh = () => {
    router.invalidate();
  };

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        onClick={onAddDataset}
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
