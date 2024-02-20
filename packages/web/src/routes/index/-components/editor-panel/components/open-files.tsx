import { Code2, PlusIcon, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";

export default function OpenFileTabs() {
  const { editors, dispatch, onCloseEditor } = useSession();

  const onOpenEditor = (path: string) => {
    if (!dispatch) return;

    dispatch({
      type: "FOCUS_EDITOR",
      payload: {
        path,
      },
    });
  };

  return (
    <div className="flex h-8 max-h-8 flex-[0_0_auto] flex-row justify-between overflow-auto overflow-y-hidden bg-muted">
      <div className="flex size-full items-center">
        {editors
          .filter((editor) => editor.isOpen)
          .map((editor) => {
            const isCurrent = editor.isFocused;

            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <div
                role="button"
                className={cn(
                  "flex h-8 flex-[0_0_auto] cursor-pointer flex-row flex-nowrap items-center gap-[1ch] bg-secondary p-[0.5rem_1ch] text-foreground transition-colors",
                  isCurrent && "bg-foreground text-secondary",
                )}
                data-current={isCurrent || undefined}
                key={editor.path}
                onClick={() => onOpenEditor(editor.path)}
              >
                <Code2 className="size-5" />
                <span className="text-sm">{editor.path}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseEditor(editor.path);
                  }}
                  className={cn(
                    "rounded-sm bg-inherit px-0.5 py-0 hover:bg-gray-200 dark:hover:bg-gray-200/10",
                    isCurrent &&
                      "hover:bg-background/30 dark:hover:bg-gray-200",
                  )}
                >
                  <X
                    className="size-4"
                    type="close"
                  />
                </button>
              </div>
            );
          })}

        <div className="flex h-8 items-center">
          <AddNewFileButton />
        </div>
      </div>
      <Separator orientation="vertical" />
    </div>
  );
}

function AddNewFileButton() {
  const { onAddEditor } = useSession();

  return (
    <button
      onClick={onAddEditor}
      className="flex size-8 items-center justify-center hover:bg-gray-200"
      type="button"
    >
      <PlusIcon className="size-5" />
    </button>
  );
}
