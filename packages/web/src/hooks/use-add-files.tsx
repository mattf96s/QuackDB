import { useCallback, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { wrap } from "comlink";
import type { AddFilesHandlesWorker } from "@/workers/add-files-worker";

type UseAddFilesProps = {
  withRedirect?: boolean;
};

export default function useAddFiles(props?: UseAddFilesProps) {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const onAddFilesHandler = useCallback(async () => {
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

      router.invalidate();

      const firstFileId = fileHandles.length > 0 ? fileHandles[0]?.name : null;
      if (props?.withRedirect && firstFileId) {
        router.navigate({
          to: "/files/$fileId",
          params: {
            fileId: firstFileId,
          },
        });
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // User cancelled
      console.error("Error in onAddFilesHandler: ", e);
    } finally {
      setIsLoading(false);
      worker?.terminate();
    }
  }, [props?.withRedirect, router]);

  return useMemo(
    () => ({
      isLoading,
      onAddFilesHandler,
    }),
    [isLoading, onAddFilesHandler],
  );
}
