import { useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dropdown-menu";
import { useDB } from "../../-db-context";
import type { PanelFile } from "../../-types";

type CodeActionMenuProps = {
  sql: string;
  currentFile: PanelFile;
  isEditorFocused: boolean;
};

type FormatOptions = "csv" | "json" | "parquet";

const formatTypes: Record<FormatOptions, FilePickerAcceptType> = {
  csv: {
    description: "CSV Files",
    accept: {
      "text/csv": [".csv"],
    },
  },
  json: {
    description: "JSON Files",
    accept: {
      "application/json": [".json"],
    },
  },
  parquet: {
    description: "Parquet Files",
    accept: {
      "application/parquet": [".parquet"],
    },
  },
};

const EXPORT_VIEW = "codeaction";

export default function CodeActionMenu({
  sql,
  currentFile,
}: CodeActionMenuProps) {
  const { db } = useDB();

  const handleSave = useCallback(
    async (format: FormatOptions) => {
      try {
        const name = currentFile.fileName.split(".")[0];
        const formatType = formatTypes[format];

        const newHandle = await window.showSaveFilePicker({
          suggestedName: `${name}.${format}`,
          types: [formatType],
        });

        // get results
        const conn = await db.connect();

        // save query as a view
        await conn.query(`CREATE OR REPLACE VIEW ${EXPORT_VIEW} AS ${sql}`);

        const results = await db.fetchResults({
          query: `SELECT sql FROM duckdb_views() WHERE view_name = ${EXPORT_VIEW};`,
        });

        console.log(results);

        // create a FileSystemWritableFileStream to write to
        const writableStream = await newHandle.createWritable();

        // write our file
        await writableStream.write(results);

        // close the file and write the contents to disk.
        await writableStream.close();

        toast.success("File saved successfully");
      } catch (e) {
        // if the user cancels
        if (e instanceof DOMException && e.name === "AbortError") return;

        console.error("Failed to save the file: ", e);
        toast.error("Failed to save the file", {
          description: e instanceof Error ? e.message : undefined,
        });
      }
    },
    [currentFile.fileName, db, sql],
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-7"
          variant="outline"
        >
          Save Results
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{currentFile.fileName ?? "File"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleSave("csv")}>
            Save as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSave("json")}>
            Save as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSave("parquet")}>
            Save as Parquet
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Team</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Email</DropdownMenuItem>
                <DropdownMenuItem>Message</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>More...</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem>
            New Team
            <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
