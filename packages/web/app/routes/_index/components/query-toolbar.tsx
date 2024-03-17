import { Button } from "~/components/ui/button";

import { ChevronDown, Play } from "lucide-react";
import { useCallback, useState, type MouseEventHandler } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSpinDelay } from "spin-delay";
import { Tag } from "~/components/tag";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "~/components/ui/menubar";
import { Separator } from "~/components/ui/separator";
import { useDB } from "~/context/db/useDB";
import { useEditor } from "~/context/editor/useEditor";
import { useQuery } from "~/context/query/useQuery";

export default function Toolbar() {
  const { status, onCancelQuery, onRunQuery } = useQuery();
  const { editorRef } = useEditor();

  // run the whole file contents rather than the selected text;
  // Don't wait;

  const onRun = useCallback(async () => {
    const controller = new AbortController();
    const signal = controller.signal;

    const editor = editorRef.current?.getEditor();
    if (!editor) {
      toast.warning("Editor not ready yet", {
        description: "Please wait a moment and try again.",
      });
      return;
    }

    const query = editor?.getModel()?.getValue();

    if (!query) {
      toast.warning("No query to run", {
        description: "Please write a query and try again.",
      });
      return;
    }

    signal.addEventListener("abort", () => {
      onCancelQuery("cancelled");
      toast.info("Query cancelled", {
        description: "The query was cancelled.",
      });
    });

    // cleanup query to remove comments and empty lines
    const cleanedQuery = query
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    await onRunQuery(cleanedQuery);

    return () => {
      controller.abort();
    };
  }, [editorRef, onCancelQuery, onRunQuery]);

  useHotkeys(
    "mod+enter",
    () => {
      if (status === "RUNNING") {
        onCancelQuery("cancelled");
      } else {
        onRun();
      }
    },
    [status, onCancelQuery, onRun],
  );

  const isLoading = useSpinDelay(status === "RUNNING", {
    delay: 0,
    minDuration: 100,
  });

  if (isLoading) {
    return (
      <Button
        size="sm"
        onClick={() => onCancelQuery("cancelled")}
        className="h-7 w-20"
        variant="destructive"
      >
        Cancel
      </Button>
    );
  }

  return (
    <Menubar className="rounded-none border-none bg-inherit p-0 shadow-none">
      <MenubarMenu>
        <div className="inline-flex h-8 items-center overflow-hidden rounded-sm bg-[#30a46c] text-white shadow-sm">
          <button
            type="button"
            onClick={onRun}
            className="inline-flex h-8 items-center justify-center whitespace-nowrap px-3 text-xs font-semibold transition-colors hover:bg-[#2b9a66] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <span className="hidden sm:block">Run Query</span>
            <Play
              size={16}
              className="block sm:hidden"
            />
          </button>
          <Separator
            orientation="vertical"
            className="h-full"
          />
          <MenubarTrigger className="inline-flex size-full items-center justify-center rounded-none px-1.5 hover:bg-[#2b9a66]">
            <ChevronDown size={16} />
          </MenubarTrigger>
        </div>
        <MenubarContent className="mr-12">
          <MenubarItem
            disabled
            className="inline-flex items-center"
          >
            <span className="mr-2">Import Session</span>
            <Tag
              color="amber"
              variant="small"
            >
              soon
            </Tag>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Export</MenubarSubTrigger>
            <MenubarSubContent>
              <Exporter ext="CSV" />
              <Exporter ext="PARQUET" />
              <Exporter
                ext="JSON"
                disabled
              />
              <Exporter
                ext="DuckDB"
                disabled
              />
              <Exporter
                ext="SQL"
                disabled
              />

              <ExportToCopy />
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

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

type FileExt = "CSV" | "PARQUET" | "JSON" | "ARROW" | "DuckDB" | "SQL";
type ExporterProps = {
  ext: FileExt;
  disabled?: boolean;
};

function Exporter(props: ExporterProps) {
  const [isExporting, setIsExporting] = useState(false);

  const { db } = useDB();
  const { meta } = useQuery();

  const { ext, disabled } = props;
  const lastRunSQL = meta?.sql;

  const onExport = useCallback(
    async (format: FileExt) => {
      if (!db) return;
      if (!lastRunSQL) return;

      setIsExporting(true);

      let downloadUrl: string | undefined; // need to release the object URL after the download

      toast.info("Exporting data...", {
        description: `Your data is being exported in the background`,
      });
      try {
        const tableName = "quackdb_export";

        // remove any trailing whitespace and newlines
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
          case "CSV": {
            sql = `COPY '${tableName}' TO 'output.${format.toLowerCase()}' (HEADER, DELIMITER ',');`;
            break;
          }
          default:
            break;
        }

        if (!sql) {
          throw new Error(`Unsupported export format: ${format}`);
        }

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

        await _db.dropFile(`output.${format.toLowerCase()}`).catch((e) => {
          console.error("Failed to drop file: ", e);
        });
        await db.query(`DROP TABLE '${tableName}'`).catch((e) => {
          console.error("Failed to drop table: ", e);
        });
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
    <MenubarItem
      disabled={disabled}
      onSelect={async () => await onExport(ext)}
    >
      <span className="mr-2">{ext}</span>
      {disabled && (
        <Tag
          color="amber"
          variant="small"
        >
          soon
        </Tag>
      )}
    </MenubarItem>
  );
}

function ExportToCopy() {
  const { table } = useQuery();

  const onCopy: MouseEventHandler<HTMLDivElement> = useCallback(
    async (_e) => {
      try {
        const rows = table.toArray().map((row) => row.toJSON());
        const dataset = JSON.stringify(rows, null, 2);
        await navigator.clipboard.writeText(dataset);
        toast.success("Copied to clipboard", {
          duration: 5000,
        });
      } catch (e) {
        console.error("Failed to copy to clipboard", e);
        toast.error("Failed to copy to clipboard", {
          description: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [table],
  );

  return <MenubarItem onClick={onCopy}>Copy Rows</MenubarItem>;
}
