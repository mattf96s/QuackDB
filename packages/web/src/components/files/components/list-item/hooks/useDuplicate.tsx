import { useCallback, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { wrap } from "comlink";
import { toast } from "sonner";
import { type DuplicateFileWorker } from "@/workers/duplicate";

const useDuplicateWorker = () => {
  const router = useRouter();
  // const wrapperRef = useRef<Remote<DuplicateFileWorker> | null>(null);
  // initializing is setting up the worker; loading is when the worker is doing something; idle is when the worker is ready to do something
  const [status, setStatus] = useState<"initializing" | "loading" | "idle">(
    "initializing",
  );

  const onDuplicate = useCallback(
    async (handle: FileSystemFileHandle) => {
      try {
        setStatus("loading");
        const worker = new Worker(
          new URL("@/workers/duplicate.ts", import.meta.url).href,
          {
            type: "module",
          },
        );
        const wrapper = wrap<DuplicateFileWorker>(worker);
        const newFile = await wrapper(handle);
        router.invalidate();
        setStatus("idle");
      } catch (e) {
        toast.error("Error", {
          description: e instanceof Error ? e.message : undefined,
        });
        setStatus("idle");
      }
    },
    [router],
  );

  return {
    onDuplicate,
    status,
  };
};

export default useDuplicateWorker;
