import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Icon from "~/components/icon";
import { Button } from "~/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useDB } from "~/context/db/useDB";
import { useSession } from "~/context/session/useSession";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { cn } from "~/lib/utils";
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

  let pathWithoutExt = path.slice(0, path.length - ext.length - 1); // remove the dot too

  /* 
    Unquoted identifiers need to conform to a number of rules:
    They must not be a reserved keyword (see duckdb_keywords()), e.g., SELECT 123 AS SELECT will fail.
    They must not start with a number or special character, e.g., SELECT 123 AS 1col is invalid.
    They cannot contain whitespaces (including tabs and newline characters).
  */

  // remove any special characters
  pathWithoutExt = pathWithoutExt.replace(/[^a-zA-Z0-9_]/g, "_");
  // remove any leading numbers
  pathWithoutExt = pathWithoutExt.replace(/^[0-9]+/, "_");
  // remove any leading special characters
  pathWithoutExt = pathWithoutExt.replace(/^[^a-zA-Z_]+/, "_");
  // remove whitespaces
  pathWithoutExt = pathWithoutExt.replace(/\s+/g, "_");
  // remove tabs
  pathWithoutExt = pathWithoutExt.replace(/\t+/g, "_");
  // remove newlines
  pathWithoutExt = pathWithoutExt.replace(/\n+/g, "_");

  const onCopy = async () => {
    let snippet = "";

    switch (mimeType) {
      case "application/json": {
        snippet = `CREATE OR REPLACE TABLE '${pathWithoutExt}' AS SELECT * FROM read_json_auto('${path}');\nSUMMARIZE ${pathWithoutExt};`;
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
 * Only Chrome supports window.showOpenFilePicker.
 */
const useModernFilePicker = () => {
  const { onAddDataSources } = useSession();
  const { db } = useDB();

  const onAddFiles = useCallback(async () => {
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

  return onAddFiles;
};

const usePolfillFilePicker = () => {
  const { onAddDataSources } = useSession();
  const { db } = useDB();

  const onAddFiles = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept =
      ".parquet,.csv,.json,.txt,.xls,.xlsx,.sql,application/octet-stream,csv/*,json/*,text/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain";

    input.addEventListener("change", async (e) => {
      const files = (e.target as HTMLInputElement).files;

      if (!files || files.length === 0) return;

      const newSources = await onAddDataSources(
        Array.from(files).map((file) => ({
          filename: file.name,
          type: "FILE",
          entry: file,
        })),
      );

      if (!newSources || newSources.length === 0) return;

      for await (const { handle } of newSources) {
        await db?.registerFileHandle(handle.name, handle);
      }
    });

    input.click();
  }, [db, onAddDataSources]);

  return onAddFiles;
};

/**
 * Manage datasets.
 *
 * @component
 */
function SourcesToolbar() {
  const [showAddDataModal, setShowAddDataModal] = useState<
    "REMOTE" | "PASTE" | "OFF"
  >("OFF");

  const modernPicker = useModernFilePicker();
  const pollfillPicker = usePolfillFilePicker();

  const onAddFiles = useCallback(() => {
    if ("showOpenFilePicker" in window) {
      return modernPicker();
    } else {
      return pollfillPicker();
    }
  }, [modernPicker, pollfillPicker]);

  const onClose = useCallback(() => {
    setShowAddDataModal("OFF");
  }, []);

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
          <DropdownMenuLabel>Add data source</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onAddFiles}>
              Local file
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowAddDataModal("REMOTE")}>
              Remote URL
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled
              onClick={() => setShowAddDataModal("PASTE")}
            >
              Paste
              <span className="ml-2 rounded-full border border-gray-500 bg-transparent px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                soon
              </span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* content dialog */}
      <AddDataModal
        isOpen={showAddDataModal !== "OFF"}
        onOpenChange={onClose}
      >
        {showAddDataModal === "REMOTE" && <AddRemoteUrl onclose={onClose} />}
        {showAddDataModal === "PASTE" && <AddPasteData />}
      </AddDataModal>
    </>
  );
}

function AddPasteData() {
  return <Textarea placeholder="Paste data here" />;
}

type AddDataModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
};

function AddDataModal(props: AddDataModalProps) {
  const { isOpen, onOpenChange, children } = props;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md lg:max-w-xl">
        {children}
      </DialogContent>
    </Dialog>
  );
}

const addRemoteUrlSchema = z.object({
  name: z.string().min(2),
  url: z.string().url(),
});

function AddRemoteUrl(props: { onclose: () => void }) {
  const { onAddDataSources } = useSession();

  const form = useForm<z.infer<typeof addRemoteUrlSchema>>({
    resolver: zodResolver(addRemoteUrlSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  async function onSubmit(values: z.infer<typeof addRemoteUrlSchema>) {
    // ensure the filename ends with .url
    let filename = values.name;
    if (!filename.endsWith(".url")) {
      filename += ".url";
    }
    const res = await onAddDataSources([
      {
        filename,
        type: "URL",
        entry: values.url,
      },
    ]);

    if (!res || res.length === 0) {
      toast.error("Failed to add remote datasource", {
        description: "Please try again",
      });

      return;
    }

    // register the datasource

    props.onclose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Remote Datasource</DialogTitle>
        <DialogDescription>
          Add a datasource from a remote URL.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="common-words"
                    autoCapitalize="off"
                    autoCorrect="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A unique name for the datasource.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://api.datamuse.com/words?ml=sql"
                    autoCapitalize="off"
                    autoCorrect="off"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {`The API needs to support CORS. If it doesn't, you can use the
                  "Paste" option.`}
                </FormDescription>
              </FormItem>
            )}
          />
          <div className="flex items-center justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </>
  );
}
