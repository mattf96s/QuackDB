import { Loader2, MoreVertical } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useDB } from "~/context/db/useDB";
import { useQuery } from "~/context/query/useQuery";

const endsWithNewline = (text: string) => /\n$/.test(text);
const removeTrailingNewline = (text: string) => {
  if (endsWithNewline(text)) {
    return text.slice(0, -1);
  }
  return text;
};
const removeWhitespace = (text: string) => text.replaceAll(/\s+/g, " ");

const unformatSQL = (sql: string) => {
  return removeTrailingNewline(removeWhitespace(sql));
};

/**
 * Actions for the dataset.
 *
 * Includes options to save, export etc.
 */
export default function DatasetActions() {
  const [isExporting, setIsExporting] = useState(false);

  const { db } = useDB();
  const { meta } = useQuery();

  const lastRunSQL = meta?.sql;
  // WIP
  const onExport = useCallback(
    async (format: "CSV" | "PARQUET" | "JSON" | "ARROW") => {
      if (!db) return;
      if (!lastRunSQL) return;

      setIsExporting(true);

      let downloadUrl: string | undefined; // need to release the object URL after the download

      try {
        const tableName = "quackdb_export";

        // // remove any trailing whitespace and newlines
        const cleanSQL = unformatSQL(lastRunSQL);
        const queries = cleanSQL
          .split(";")
          .filter((query) => query.trim().length);

        // assume the last query is a SELECT query for exporting
        const selectQuery = queries[queries.length - 1];

        if (!selectQuery) {
          throw new Error("No query to export", {
            cause: `The last query executed was: ${selectQuery}`,
          });
        }

        await db.query(
          `CREATE OR REPLACE TABLE '${tableName}' AS (${selectQuery})`,
        );

        let sql: string = "";
        switch (format) {
          case "PARQUET": {
            sql = `COPY (SELECT * FROM '${tableName}') TO 'output.${format.toLowerCase()}' (FORMAT 'PARQUET');`;
            break;
          }
          default:
            break;
        }

        if (!sql) return;

        await db.query(sql);
        const _db = await db._getDB();

        const buffer = await _db.copyFileToBuffer(
          `output.${format.toLowerCase()}`,
        );

        // Generate a download link (ensure to revoke the object URL after the download).
        // We could use window.showSaveFilePicker() but it is only supported in Chrome.
        downloadUrl = URL.createObjectURL(new Blob([buffer]));

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${tableName}.${format.toLowerCase()}`;

        a.click();

        toast.success("Data exported successfully", {
          description: `Your data has been exported as ${format.toLowerCase()}`,
        });

        await _db.dropFile(`output.${format.toLowerCase()}`);
      } catch (e) {
        console.error("Failed to export data: ", e);
        toast.error("Failed to export data", {
          description:
            e instanceof Error
              ? e.message
              : "Something went wrong. Please try again.",
        });
      } finally {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setIsExporting(false);
      }
    },
    [db, lastRunSQL],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
        >
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Results</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            Save
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={async (e) => {
                    e.preventDefault();
                    await onExport("PARQUET");
                  }}
                  disabled={isExporting}
                >
                  Parquet{" "}
                  {isExporting && (
                    <Loader2 className="ml-2 size-4 animate-spin" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem disabled>JSON</DropdownMenuItem>
                <DropdownMenuItem disabled>CSV</DropdownMenuItem>
                <DropdownMenuItem disabled>Arrow</DropdownMenuItem>
                <DropdownMenuItem disabled>DuckDB</DropdownMenuItem>
                <DropdownMenuItem disabled>Copy</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
