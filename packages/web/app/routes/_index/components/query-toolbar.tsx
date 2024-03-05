import Icon from "~/components/icon";
import { Button } from "~/components/ui/button";

import { useCallback, type MouseEventHandler } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSpinDelay } from "spin-delay";
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
            Run Query
          </button>
          <Separator
            orientation="vertical"
            className="h-full"
          />
          <MenubarTrigger className="inline-flex size-full items-center justify-center rounded-none px-1.5 hover:bg-[#2b9a66]">
            <Icon
              name="ChevronDown"
              size={16}
            />
          </MenubarTrigger>
        </div>
        <MenubarContent className="mr-12">
          <MenubarItem disabled>Save Query</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Export</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem disabled>CSV</MenubarItem>
              <MenubarItem disabled>Parquet</MenubarItem>
              <MenubarItem disabled>JSON</MenubarItem>
              <MenubarItem disabled>DuckDB</MenubarItem>
              <MenubarItem disabled>SQL</MenubarItem>
              <ExportToCopy />
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

function ExportToCopy() {
  const { rows } = useQuery();

  const onCopy: MouseEventHandler<HTMLDivElement> = useCallback(
    async (e) => {
      e.preventDefault();

      try {
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
    [rows],
  );

  return <MenubarItem onClick={onCopy}>Copy Rows</MenubarItem>;
}
