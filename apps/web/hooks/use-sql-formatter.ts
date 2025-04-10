// hooks/useSqlFormatter.ts
import { useCallback, useEffect, useRef } from "react";

type FormatCallback = (formatted: string) => void;

export function useSqlFormatter(onFormatted: FormatCallback) {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (!workerRef.current) {
      // window.Worker works but not just Worker (haven't investigated why)
      workerRef.current = new window.Worker(
        "/worker-dist/sql-formatter.worker.js",
        {
          type: "module",
        }
      );

      workerRef.current.onmessage = (event) => {
        const { formattedCode } = event.data;

        onFormatted(formattedCode);
      };
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [onFormatted]);

  const formatSql = useCallback((sql: string) => {
    if (!workerRef.current) return;
    workerRef.current?.postMessage({ code: sql });
  }, []);

  return { formatSql };
}
