import { cn } from "@/lib/utils";
import { PopoverAnchor, PopoverTrigger } from "@radix-ui/react-popover";
import { ChevronDown, Code, Dot, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent } from "~/components/ui/popover";
import type { CodeEditor } from "~/context/session/types";
import { useSession } from "~/context/session/useSession";
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
    <div className="flex w-full flex-col">
      <div className="flex w-full items-center justify-between">
        <div className="flex grow items-center">
          <Button
            onClick={onToggle}
            variant="ghost"
            className="flex w-full items-center justify-start gap-1 rounded-none hover:bg-transparent"
          >
            <ChevronDown
              className={cn(
                "size-5",
                isCollapsed && "-rotate-90 transition-transform"
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
          "flex w-full flex-col space-y-1 py-1 pl-4 pr-8",
          isCollapsed && "hidden"
        )}
      >
        {editors.map((editor) => (
          <CodeEditorItem key={editor.path} {...editor} />
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
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
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
  const [isEditing, setIsEditing] = useState(false);

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
        <ContextMenuTrigger className="w-full data-[state=open]:bg-gray-100 data-[state=open]:dark:bg-gray-900">
          <Button
            className={cn(
              "flex h-6 w-full items-center justify-between gap-2 overflow-hidden p-2",
              isFocused && "bg-secondary"
            )}
            variant="ghost"
            onClick={onOpenFile}
          >
            <div className="inline-flex items-center gap-1">
              <Code
                className={cn(
                  "mr-0.5 size-4 shrink-0",
                  editor.isDirty && "text-orange-500 dark:text-yellow-500"
                )}
              />

              <span
                className={cn(
                  "truncate font-normal",
                  editor.isDirty && "text-orange-500 dark:text-yellow-500"
                )}
              >
                {editor.path}
              </span>
            </div>

            {editor.isDirty && (
              <Dot
                className={cn("size-8 text-orange-500 dark:text-yellow-500")}
              />
            )}
          </Button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem inset onSelect={() => onOpenFile()}>
            Open
          </ContextMenuItem>

          <ContextMenuItem onSelect={() => setIsEditing(true)} inset>
            Rename
          </ContextMenuItem>

          <ContextMenuSeparator />
          <ContextMenuItem onSelect={() => setShowDelete(true)} inset>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <RenamePopover
        filename={editor.path}
        isOpen={isEditing}
        onOpenChange={(open) => setIsEditing(open)}
      >
        <span />
      </RenamePopover>

      <DeleteEditorModal
        isOpen={showDelete}
        onOpenChange={(open) => setShowDelete(open)}
        path={editor.path}
      />
    </>
  );
}

type RenamePopoverProps = {
  filename: string;
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const filenameSchema = z.string().endsWith(".sql");

function RenamePopover(props: RenamePopoverProps) {
  const { filename, children, isOpen, onOpenChange } = props;
  const [isLoading, setIsLoading] = useState(false);

  const { onRenameEditor } = useSession();

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const newName = formData.get("file") as string;

    const validation = filenameSchema.safeParse(newName);
    if (!validation.success) {
      toast.error("Invalid file name", {
        description: "File name must end with .sql",
      });
      setIsLoading(false);
      return;
    }

    try {
      await onRenameEditor(filename, newName);
      toast.success("File renamed", {
        description: `File ${filename} renamed to ${newName}`,
      });
      onOpenChange(false);
    } catch (e) {
      toast.error("Failed to rename file");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange} modal>
      <PopoverAnchor asChild>
        <PopoverTrigger>{children}</PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent className="w-80">
        <form method="post" onSubmit={onSubmitHandler} id="rename-form">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Rename</h4>
              <p className="text-sm text-muted-foreground">
                Include the file extension.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label form="rename-form" htmlFor="file">
                  File
                </Label>
                <Input
                  id="file"
                  name="file"
                  defaultValue={filename}
                  className="col-span-3 h-8"
                  form="rename-form"
                />
              </div>
            </div>
            <Button
              form="rename-form"
              size="sm"
              type="submit"
              disabled={isLoading}
            >
              Save changes
              {isLoading && <Loader2 size={16} className="ml-2 animate-spin" />}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
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
      <Button size="xs" variant="ghost" onClick={onAddEditor}>
        <Plus size={16} />
      </Button>
    </>
  );
}
