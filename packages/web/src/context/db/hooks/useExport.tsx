import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useDB } from "../useDB";

/**
 * Export content from the database.
 *
 * We need to register the file handles and then export the content.
 */
export const useExport = () => {
  const { db } = useDB();
  const [status, setStatus] = useState<"IDLE" | "RUNNING">("IDLE");

  type OnExportHandlerProps = {
    format: "csv" | "json" | "parquet" | "arrow" | "txt" | "duckdb";
  };

  const onExportHandler = useCallback(
    async ({ format }: OnExportHandlerProps) => {
      if (!db) {
        console.error("Cannot export as no database found");
        toast.error("No database found", {
          description: "Try reloading the page.",
        });
        return;
      }
      setStatus("RUNNING");

      try {
        const handle = await showSaveFilePicker({
          startIn: "documents",
          types: [
            {
              description: "CSV file",
              accept: {
                "text/csv": [".csv"],
              },
            },
            {
              description: "JSON file",
              accept: {
                "application/json": [".json"],
              },
            },
            {
              description: "Parquet file",
              accept: {
                "application/parquet": [".parquet"],
              },
            },
            {
              description: "Arrow file",
              accept: {
                "application/arrow": [".arrow"],
              },
            },
            {
              description: "Text file",
              accept: {
                "text/plain": [".txt"],
              },
            },
            {
              description: "DuckDB file",
              accept: {
                "application/duckdb": [".duckdb"],
              },
            },
          ],
        });

        // user cancelled
        if (!handle) {
          setStatus("IDLE");
          return;
        }

        console.log("handle", handle);

        toast.info("Exporting data", {
          description: "Please wait while we export the data.",
        });
        const results = await db.query(
          `EXPORT DATABASE '${handle.name}' (${format})`,
        );

        console.log("results", results);
        toast.success("Data exported", {
          description: `The data has been exported to ${handle.name}`,
        });
        setStatus("IDLE");
      } catch (e) {
        console.error("Error exporting data", e);
        toast.error("Error exporting data", {
          description:
            e instanceof Error
              ? e.message
              : "An error occurred. Please try again.",
        });
        setStatus("IDLE");
      }
    },
    [db],
  );

  return {
    status,
    onExport: onExportHandler,
  };
};
