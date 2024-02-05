import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { wrap } from "comlink";
import { format } from "date-fns";
import { Copy, CopyCheck, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { TreeNode, TreeNodeData } from "@/components/files/context/types";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils/inflect";
import { createInsertSnippet } from "@/utils/duckdb/helpers/insert-snippet";
import type { AddFilesHandlesWorker } from "@/workers/add-files-worker";

const fileTypeColors: Record<string, string> = {
  sql: "bg-orange-100 text-orange-800",
  csv: "bg-green-100 text-green-800",
  parquet: "bg-blue-100 text-blue-800",
  json: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

type EntityListProps = {
  files: TreeNode<TreeNodeData>[];
};

export default function EntityList(props: EntityListProps) {
  const workerRef = useRef<null | Worker>(null);
  const router = useRouter();

  const files = props.files;

  const onAddFiles = useCallback(async () => {
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

      const worker = new Worker(
        new URL("@/workers/add-files-worker.ts", import.meta.url),
        {
          type: "module",
        },
      );

      workerRef.current = worker;

      const addFilesWorkerFn = wrap<AddFilesHandlesWorker>(worker);
      const { success, total } = await addFilesWorkerFn(fileHandles);

      if (success) {
        toast.success("Files added successfully", {
          description: `${total} files added`,
        });
        router.invalidate();
      } else {
        toast.error("Failed to add files", {
          description: "Failed to add files",
        });
      }
    } catch (e) {
      // ignore aborted request
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Failed to add filehandles: ", e);
      toast.error("Failed to add files", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }, [router]);

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const onRefresh = () => {
    router.invalidate();
  };
  return (
    <div className="hidden w-full flex-col md:flex">
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold">Tables</h3>
        <div className="inline-flex items-center gap-2">
          <Button
            size="xs"
            variant="ghost"
            onClick={onAddFiles}
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
        </div>
      </div>
      <Separator />
      <ScrollArea className="flex h-[400px] flex-col py-4">
        {files.map((file) => {
          const fileType = file.name.split(".").pop() ?? "default";

          const color =
            fileTypeColors[fileType.toLowerCase()] ?? fileTypeColors.default;
          return (
            <ContextMenu key={file.id}>
              <ContextMenuTrigger className="data-[state=open]:bg-gray-100">
                <Button
                  asChild
                  key={file.id}
                  variant="ghost"
                  className="my-2 flex rounded-none bg-inherit"
                >
                  <li className="flex items-center justify-between gap-x-6 px-2 py-8">
                    <div className="min-w-0">
                      <div className="flex items-start gap-x-3">
                        <p className="text-sm font-semibold leading-6 text-gray-900">
                          {file.name}
                        </p>
                        <p
                          className={cn(
                            color,
                            "mt-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                          )}
                        >
                          {fileType}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                        <p className="whitespace-nowrap">
                          Created on{" "}
                          <time
                            dateTime={new Date(
                              file.data.lastModified,
                            ).toISOString()}
                          >
                            {format(
                              new Date(file.data.lastModified),
                              "MMM dd, yyyy",
                            )}
                          </time>
                        </p>
                        <svg
                          viewBox="0 0 2 2"
                          className="h-0.5 w-0.5 fill-current"
                        >
                          <circle
                            cx={1}
                            cy={1}
                            r={1}
                          />
                        </svg>
                        <p className="truncate">
                          {formatBytes(file.data.fileSize)}
                        </p>
                      </div>
                    </div>
                  </li>
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
        {files.length === 0 && (
          <div className="flex h-full items-center justify-center">
            No files found
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function CardContent(props: { file: TreeNode<TreeNodeData> }) {
  const [file, setFile] = useState<null | File>(null);
  const [isCopied, setIsCopied] = useState(false);
  const insertSnippet = file ? createInsertSnippet(file) : "";

  useEffect(() => {
    const parseFile = async (handle: FileSystemFileHandle) => {
      const file = await handle.getFile();
      setFile(file);
    };
    parseFile(props.file.data.handle);
  }, [props]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(insertSnippet);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Insert Table</h4>
        <div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onCopy}
          >
            {isCopied ? (
              <CopyCheck className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <div>
        {/* https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/code.css */}
        <code
          style={{
            background: "rgba(0, 71, 241, 0.07)",
            color: "rgba(0, 43, 183, 0.7)",
          }}
          className="box-border inline-block rounded-md p-1 text-sm font-normal"
        >
          {insertSnippet}
        </code>
      </div>
    </div>
  );
}
