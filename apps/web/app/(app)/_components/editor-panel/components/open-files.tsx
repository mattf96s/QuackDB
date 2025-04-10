/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";
import { Code2, Plus, X } from "lucide-react";

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
    <div className="flex max-h-9 min-h-9 flex-row justify-between overflow-hidden overflow-x-auto bg-[#f3f3f3] dark:bg-background">
      <div className="flex size-full items-center">
        {editors
          .filter((editor) => editor.isOpen)
          .map((editor) => {
            const isCurrent = editor.isFocused;

            return (
              <div
                role="button"
                className={cn(
                  "flex h-full cursor-pointer flex-row flex-nowrap items-center gap-1 rounded-none border-x border-t border-t-transparent bg-[#ececec] pl-2 text-[#3d3d3d] first:border-l-0 hover:bg-[#d9d9d9] dark:bg-background dark:text-foreground dark:hover:bg-[#1f1f1f]",
                  isCurrent &&
                    "border-t-0 bg-white text-[#3d3d3d] hover:bg-background dark:border-t dark:border-t-blue-600 dark:bg-[#1e1e1e] dark:text-secondary-foreground dark:hover:bg-[#1e1e1e] "
                )}
                data-current={isCurrent || undefined}
                key={editor.path}
                onClick={() => onOpenEditor(editor.path)}
              >
                <Code2 className="mr-1 size-4" />
                <span className="text-sm">{editor.path}</span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseEditor(editor.path);
                  }}
                  className={cn(
                    "h-full bg-inherit px-2 hover:bg-gray-200 dark:hover:bg-gray-200/10",
                    isCurrent &&
                      "hover:bg-secondary dark:hover:bg-muted-foreground/10"
                  )}
                >
                  <X className="size-4" type="close" />
                </button>
              </div>
            );
          })}

        <div className="ml-auto flex h-full items-center">
          <AddNewFileButton />
        </div>
      </div>
    </div>
  );
}

function AddNewFileButton() {
  const { onAddEditor } = useSession();

  return (
    <button
      onClick={onAddEditor}
      className="flex h-9 w-12 items-center justify-center rounded-none hover:bg-secondary dark:hover:bg-gray-200/10"
      type="button"
    >
      <Plus className="size-5" />
    </button>
  );
}
