import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDB } from "@/context/db/useDB";
import { useSession } from "@/context/session/useSession";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { useCallback } from "react";
import { toast } from "sonner";
import { useWrapper } from "./wrapper/context/useWrapper";

export default function DataSources() {
  const { sources } = useSession();
  const { ref, isCollapsed } = useWrapper();

  const onToggle = () => {
    if (!ref.current) {
      console.warn("No panel ref found");
      return;
    }

    const isExpanded = ref.current.isExpanded();

    if (isExpanded) {
      ref.current.collapse();
    } else {
      ref.current.expand();
    }
  };

  return (
    <div className="flex w-full flex-col pt-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex grow">
          <Button
            onClick={onToggle}
            variant="ghost"
            className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
          >
            <Icon
              name="ChevronDown"
              className={cn(
                "size-5",
                isCollapsed && "-rotate-90 transition-transform",
              )}
            />
            <span className="text-sm font-semibold">Source</span>
          </Button>
        </div>
        <div className="flex items-center gap-1 px-2">
          <SourcesToolbar />
        </div>
      </div>
      <div
        className={cn(
          "flex w-full flex-col gap-1 py-1",
          isCollapsed && "hidden",
        )}
      >
        {sources.map((source) => (
          <DatesetItem
            key={source.path}
            {...source}
          />
        ))}
      </div>
    </div>
  );
}

type SourceEntry = ReturnType<typeof useSession>["sources"][number];

function DatesetItem(props: SourceEntry) {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const { ext, mimeType, path } = props;

  const pathWithoutExt = path.slice(0, path.length - ext.length - 1); // remove the dot too

  const onCopy = async () => {
    let snippet = "";

    switch (mimeType) {
      case "application/json": {
        snippet = `CREATE OR REPLACE TABLE ${pathWithoutExt} AS SELECT * FROM read_json_auto('${path}');\nSUMMARIZE ${pathWithoutExt};`;
        break;
      }
      case "application/parquet": {
        snippet = `CREATE OR REPLACE VIEW '${pathWithoutExt}' AS SELECT * FROM read_parquet('${path}');\nSUMMARIZE ${pathWithoutExt};`;
        break;
      }
      case "text/csv": {
        snippet = `CREATE OR REPLACE TABLE ${pathWithoutExt} AS SELECT * FROM read_csv_auto('${path}');\nSUMMARIZE ${pathWithoutExt};`;
        break;
      }
      default: {
        toast.error(`Unknown file type: ${path}`, {
          description: "More file types will be supported soon.",
        });
        return;
      }
    }

    await copyToClipboard(snippet.trim());

    // insert into editor
    // const editor = editorRef.current?.getEditor();
    // if (editor) {
    //   const selection = editor.getSelection();

    //   editor.executeEdits("my-source", [
    //     {
    //       text: snippet,
    //       forceMoveMarkers: false,
    //       range: {
    //         startLineNumber: selection?.selectionStartLineNumber || 1,
    //         startColumn: selection?.selectionStartColumn || 1,
    //         endLineNumber: selection?.endLineNumber || 1,
    //         endColumn: selection?.endColumn || 1,
    //       },
    //     },
    //   ]);
    // }
  };
  return (
    <ContextMenu key={path}>
      <ContextMenuTrigger className="px-8 data-[state=open]:bg-gray-100">
        <Button
          className="relative flex h-6 w-full items-center justify-start gap-2 px-0 py-2"
          variant="ghost"
          onClick={onCopy}
        >
          <Icon
            name="Database"
            className="size-4"
          />
          <span className="truncate font-normal">{path}</span>
          {isCopied && (
            <span className="absolute inset-y-0 right-0">
              <Icon
                name="CopyCheck"
                size={16}
                className="bg-transparent text-green-700"
              />
            </span>
          )}
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem inset>
          Open
          <ContextMenuShortcut>⌘O</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset>
          Rename
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem inset>
          Delete
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/**
 * Manage datasets.
 *
 * #TODO: remote sources.
 *
 * @component
 */
function SourcesToolbar() {
  const { onAddDataSources } = useSession();
  const { db } = useDB();

  const onAddDataset = useCallback(async () => {
    if (!db) {
      console.error("No db found");
      return;
    }

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
              "text/plain": [".sql"],
            },
          },
        ],
        excludeAcceptAllOption: false,
        multiple: true,
      });

      if (!fileHandles || fileHandles.length === 0) return;

      const newSources = await onAddDataSources(
        fileHandles.map((handle) => ({
          filename: handle.name,
          type: "FILE_HANDLE",
          entry: handle,
        })),
      );

      if (!newSources || newSources.length === 0) return;

      for await (const { handle } of newSources) {
        await db?.registerFileHandle(handle.name, handle);
      }
    } catch (e) {
      // ignore aborted request
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Failed to add filehandles: ", e);
      toast.error("Failed to add files", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }, [db, onAddDataSources]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
          >
            <Icon
              name="Plus"
              size={16}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56"
          // prevent focus going back to the trigger on close.
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onAddDataset}>
              Local file
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Remote URL
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Paste</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
