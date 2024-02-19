import { Pencil2Icon } from "@radix-ui/react-icons";
import { ChevronDown, DotIcon, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";
import { useWrapper } from "./wrapper/context/useWrapper";

export default function EditorSources() {
  const { editors, dispatch } = useSession();

  const onOpenFile = (path: string) => {
    if (!dispatch) return;
    const editor = editors.find((editor) => editor.path === path);

    if (!editor) {
      toast.error("Editor not found");
      return;
    }
    dispatch({
      type: "FOCUS_EDITOR",
      payload: editor,
    });
  };

  const { isCollapsed, onToggleIsCollapse } = useWrapper();

  const onCollapse = () => {
    onToggleIsCollapse(true);
  };

  const onExpand = () => {
    onToggleIsCollapse(false);
  };

  return (
    <div className="flex w-full flex-col pt-2">
      <div className="flex w-full items-center justify-between">
        <div className="flex grow">
          <Button
            onClick={isCollapsed ? onExpand : onCollapse}
            variant="ghost"
            className="flex w-full items-center justify-start gap-1 hover:bg-transparent"
          >
            <ChevronDown
              className={cn(
                "size-5",
                isCollapsed && "rotate-180 transition-transform",
              )}
            />
            <span className="text-sm font-semibold">Editor</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <SourcesToolbar />
        </div>
      </div>
      <div
        className={cn(
          "flex w-full flex-col gap-1 py-1 pr-8",
          isCollapsed && "hidden",
        )}
      >
        {editors.map((editor) => {
          const { isFocused } = editor;
          return (
            <ContextMenu key={editor.path}>
              <ContextMenuTrigger className="w-full">
                <Button
                  className={cn(
                    "mx-5 flex h-6 w-full items-center justify-between gap-2 p-2 pl-0",
                    isFocused && "bg-secondary",
                  )}
                  variant="ghost"
                  onClick={() => onOpenFile(editor.path)}
                >
                  <div className="inline-flex items-center gap-1">
                    <Pencil2Icon className="size-4" />
                    <span
                      className={cn(
                        "truncate font-normal",
                        // editor.isDirty && "text-yellow-700",
                      )}
                    >
                      {editor.path}
                    </span>
                  </div>
                  {editor.isOpen && <DotIcon className="size-4" />}
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
        })}
      </div>
    </div>
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
  const { onAddEditor } = useSession();

  return (
    <>
      <Button
        size="xs"
        variant="ghost"
        onClick={onAddEditor}
      >
        <Plus size={16} />
      </Button>
      <Button
        disabled
        size="xs"
        variant="ghost"
        // #TODO: implement refresh
        onClick={() => null}
      >
        <RefreshCw size={16} />
      </Button>
    </>
  );
}
