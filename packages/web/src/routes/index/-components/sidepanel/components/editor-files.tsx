import Icon from "@/components/icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { CodeEditor } from "@/context/session/types";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";
import { Pencil2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { toast } from "sonner";
import { useWrapper } from "./wrapper/context/useWrapper";

export default function EditorSources() {
  const { editors } = useSession();

  const { isCollapsed, ref } = useWrapper();

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
            <span className="text-sm font-semibold">Editor</span>
          </Button>
        </div>
        <div className="flex items-center gap-1 px-2">
          <SourcesToolbar />
        </div>
      </div>
      <div
        className={cn(
          "flex w-full flex-col gap-1 py-1 pr-8",
          isCollapsed && "hidden",
        )}
      >
        {editors.map((editor) => (
          <CodeEditorItem
            key={editor.path}
            {...editor}
          />
        ))}
      </div>
    </div>
  );
}

type DeleteModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
};

/**
 * Delete the editor (not close the file).
 */
function DeleteEditorModal(props: DeleteModalProps) {
  const { isOpen, onOpenChange, path } = props;

  const { onDeleteEditor } = useSession();

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the file.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => await onDeleteEditor(path)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CodeEditorItem(editor: CodeEditor) {
  const { dispatch } = useSession();
  const [showDelete, setShowDelete] = useState(false);

  const onOpenFile = () => {
    if (!dispatch) return;

    if (!editor) {
      toast.error("Editor not found");
      return;
    }
    dispatch({
      type: "FOCUS_EDITOR",
      payload: editor,
    });
  };

  const { isFocused } = editor;
  return (
    <>
      <ContextMenu key={editor.path}>
        <ContextMenuTrigger className="w-full">
          <Button
            className={cn(
              "mx-5 flex h-6 w-full items-center justify-between gap-2 p-2 pl-0",
              isFocused && "bg-secondary",
            )}
            variant="ghost"
            onClick={onOpenFile}
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
            {editor.isOpen && (
              <Icon
                name="Dot"
                className="size-4"
              />
            )}
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem
            inset
            onClick={() => setShowDelete(true)}
          >
            Open
            <ContextMenuShortcut>⌘O</ContextMenuShortcut>
          </ContextMenuItem>
          {/* #TODO */}
          <ContextMenuItem
            disabled
            inset
          >
            Rename
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => setShowDelete(true)}
            inset
          >
            Delete
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* delete editor modal */}
      <DeleteEditorModal
        isOpen={showDelete}
        onOpenChange={(open) => setShowDelete(open)}
        path={editor.path}
      />
    </>
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
        <Icon
          name="Plus"
          size={16}
        />
      </Button>
    </>
  );
}
