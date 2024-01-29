import { useEffect, useState } from "react";
import { CounterClockwiseClockIcon } from "@radix-ui/react-icons";
import { wrap } from "comlink";
import { toast } from "sonner";
import type { PreviewFileWorker } from "@/workers/preview-file";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

type TablePreviewProps = {
  handle: FileSystemFileHandle;
};

export default function JSONPreview(props: TablePreviewProps) {
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    const worker = new Worker(
      new URL("@/workers/preview-file.ts", import.meta.url),
      {
        type: "module",
      },
    );

    const wrapWorker = wrap<PreviewFileWorker>(worker);

    const parseFile = async (handle: FileSystemFileHandle) => {
      console.log(handle);
      try {
        const { columns, results: queryResults } = await wrapWorker(handle, {
          offset: 0,
          limit: 0,
        });
        console.log("columns", columns);
        setResults(queryResults);
      } catch (e) {
        toast.error("Error parsing file", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    };

    parseFile(props.handle)
      .then(() => {
        setIsLoading(false);
      })
      .catch(() => {});

    return () => {
      worker.terminate();
    };
  }, [props]);

  return (
    <div className="flex h-full flex-col space-y-4">
      <Textarea
        value={JSON.stringify(results, null, 2)}
        readOnly
        className="min-h-[400px] flex-1 p-4"
      />
      <div className="flex items-center space-x-2">
        <Button>Submit</Button>
        <Button variant="secondary">
          <span className="sr-only">Show history</span>
          <CounterClockwiseClockIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
