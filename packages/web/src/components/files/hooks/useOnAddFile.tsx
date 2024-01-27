import { wrap } from "comlink";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { type AddFilesHandlesWorker } from "workers/add-files-worker";

import { inflectedFiles } from "@/lib/utils/inflect";
import { useFileTree } from "../context";

const useAddFiles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [progress, setProgress] = useState(0);
  const [currentFilename, setCurrentFilename] = useState("");
  const { onRefreshFileTree } = useFileTree();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const storedWorker = useMemo(() => {
    if (!isClient) return null;
    return new Worker("/workers/add-files-worker.ts", {
      type: "module",
    });
  }, [isClient]);

  useEffect(() => {
    if (!storedWorker) return;
    // Only show start toast if it takes longer than 500ms
    let timerId: NodeJS.Timeout;

    const handleWorkerCallback = (ev: MessageEvent<any>) => {
      const { data } = ev;
      const type = data?.type;

      if (!type) return;

      switch (type) {
        case "start": {
          clearTimeout(timerId);
          setIsLoading(true);
          setProgress(0);
          setCurrentFilename("");

          const { payload } = data;
          let { total } = payload;

          if (typeof total !== "number") total = 0;
          const toastMessage = `Adding ${total} ${inflectedFiles(total)}`;

          timerId = setTimeout(() => {
            toast.info(toastMessage, {
              description: "Feel free to navigate away from this page.",
            });
          }, 500);
          break;
        }
        case "progress": {
          const { payload } = data;
          const { count, total, filename } = payload;

          if (filename) setCurrentFilename(filename);
          if (total > 0) {
            // TODO: exponential formula for progress bar
            setProgress(Math.round((count / total) * 100));
          }
          break;
        }
        case "complete": {
          clearTimeout(timerId);
          setIsLoading(false);
          setProgress(100);
          setCurrentFilename("");
          onRefreshFileTree()
            .then(() => {
              const { payload } = data;
              const { total } = payload;

              toast.success("Successfully added files", {
                description: `Added ${total} ${inflectedFiles(total)}`,
              });
            })
            .catch((e) => {
              console.error("Failed to refresh file tree: ", e);
              toast.error("Failed to refresh file tree", {
                description: e instanceof Error ? e.message : undefined,
              });
            });

          break;
        }
        case "error": {
          clearTimeout(timerId);
          setIsLoading(false);

          const { payload } = data;
          const error = payload?.error;

          toast.error("Failed to add files", {
            description: error?.message ?? "",
          });

          break;
        }
        default: {
          console.debug("Unknown message type: useAddFiles: ", type);
          break;
        }
      }
    };

    const worker = storedWorker;

    worker.addEventListener("message", handleWorkerCallback);

    return () => {
      clearTimeout(timerId);
      worker?.removeEventListener("message", handleWorkerCallback);
      worker.terminate();
    };
  }, [onRefreshFileTree, storedWorker]);

  const addFilesWorkerFn = useCallback(
    async (newHandles: FileSystemFileHandle[]) => {
      if (!storedWorker) {
        console.error("addFilesWorkerFn failure: worker is undefined");
        return;
      }

      await wrap<AddFilesHandlesWorker>(storedWorker)(newHandles).catch((e) => {
        console.error("Failed to add files: ", e);
        toast.error("Failed to add files", {
          description: e instanceof Error ? e.message : undefined,
        });
      });
    },
    [storedWorker],
  );

  return useMemo(
    () => ({
      isLoading,
      isPending,
      progress,
      currentFilename,
      addFilesWorkerFn,
    }),
    [currentFilename, isLoading, isPending, progress, addFilesWorkerFn],
  );
};

const useAddFilesHandler = () => {
  const props = useAddFiles();

  const onAddFilesHandler = useCallback(async () => {
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

      props.addFilesWorkerFn(fileHandles);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // User cancelled
      console.error("Error in onAddFilesHandler: ", e);
    }
  }, [props]);

  return useMemo(
    () => ({
      ...props,
      onAddFilesHandler,
    }),
    [onAddFilesHandler, props],
  );
};

export { useAddFilesHandler };
