import { memo } from "react";
import { Code2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/context/session/useSession";
import { cn } from "@/lib/utils";

const OpenFileTabs = memo(function OpenFileTabs() {
  const { editors, dispatch } = useSession();

  const onOpenEditor = (path: string) => {
    if (!dispatch) return;

    dispatch({
      type: "FOCUS_EDITOR",
      payload: {
        path,
      },
    });
  };

  const closeFile = (path: string) => {
    if (!dispatch) return;
    dispatch({
      type: "CLOSE_EDITOR",
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
              <div
                className={cn(
                  "flex h-8 flex-[0_0_auto] cursor-pointer flex-row flex-nowrap items-center gap-[1ch] border bg-gray-100 p-[0.5rem_1ch] transition-colors hover:bg-gray-200",
                  isCurrent &&
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
                data-current={isCurrent || undefined}
                key={editor.path}
                onClick={() => onOpenEditor(editor.path)}
              >
                <Code2 className="size-5" />
                <span className="text-sm">{editor.path}</span>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    closeFile(editor.path);
                  }}
                  className={cn(
                    "bg-inherit px-0.5 py-0 hover:bg-gray-300",
                    isCurrent && "hover:bg-gray-100/50",
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
      </div>
      <Separator orientation="vertical" />
    </div>
  );
});

export default OpenFileTabs;
