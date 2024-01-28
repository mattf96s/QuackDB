import { useNavigate } from "@tanstack/react-router";
import { type Remote, wrap } from "comlink";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useFileTree } from "@/components/files/context";
import { type DuplicateFileWorker } from "@/workers/duplicate";

const useDuplicateWorker = () => {
  const wrapperRef = useRef<Remote<DuplicateFileWorker> | null>(null);
  // initializing is setting up the worker; loading is when the worker is doing something; idle is when the worker is ready to do something
  const [status, setStatus] = useState<"initializing" | "loading" | "idle">(
    "initializing",
  );

  const storedWorker = useMemo(
    () =>
      new Worker(new URL("@/workers/duplicate.ts", import.meta.url).href, {
        type: "module",
      }),
    [],
  );

  const { dispatch, onRefreshFileTree } = useFileTree();

  const navigate = useNavigate();

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;

    const handleWorkerCallback = (ev: MessageEvent<any>) => {
      const { data } = ev;
      const type = data?.type;

      if (!type) return;

      switch (type) {
        case "duplicate-file-started": {
          setStatus("loading");
          clearTimeout(timerId);
          // Don't show the toast if the worker is fast
          timerId = setTimeout(() => {
            toast.info("Duplicate your file", {
              description: "This will happen in the background",
            });
          }, 1000);

          break;
        }
        case "duplicate-file-complete": {
          clearTimeout(timerId);

          const { payload } = data;
          const fileHandle = payload?.fileHandle;

          if (fileHandle) {
            toast.success("Success!", {
              description: `Added ${fileHandle.name} to your files`,
              action: {
                label: "View",
                onClick: () => {
                  navigate({
                    to: "/files/$fileId",
                    params: { fileId: fileHandle.name },
                  });
                },
              },
            });
          } else {
            toast.success("Success!", {
              description: `Duplicate file created`,
            });
          }

          onRefreshFileTree();
          setStatus("idle");

          break;
        }
        case "duplicate-file-error": {
          clearTimeout(timerId);
          const { payload } = data;
          dispatch({
            type: "SET_STATUS",
            payload: {
              status: "idle",
            },
          });
          toast.warning(payload?.error ?? "Error", {});

          break;
        }
        default: {
          break;
        }
      }
    };

    const worker = storedWorker;

    worker.addEventListener("message", handleWorkerCallback);

    setStatus("idle");

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }

      worker.removeEventListener("message", handleWorkerCallback);
      worker.terminate();
    };
  }, [dispatch, navigate, onRefreshFileTree]);

  const onDuplicate = useCallback(async (handle: FileSystemFileHandle) => {
    if (!storedWorker) {
      console.error("addFilesWorkerFn failure: worker is undefined");
      return;
    }
    const wrapper = wrap<DuplicateFileWorker>(storedWorker);
    await wrapper(handle);
  }, []);

  return {
    onDuplicate,
    status,
  };
};

export default useDuplicateWorker;
