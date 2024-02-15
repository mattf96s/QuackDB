import { Code2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { usePanel } from "@/routes/index/-context/panel/usePanel";
import { memo } from "react";

const OpenFileTabs = memo(function OpenFileTabs() {
  const { openFiles, currentFile, openFile, closeFile, files } = usePanel();
  return (
    <div className="flex h-8 max-h-8 flex-[0_0_auto] flex-row justify-between overflow-auto overflow-x-auto overflow-y-hidden bg-muted">
      <div className="flex h-full w-full items-center">
        {openFiles.map((file) => {
          const isCurrent = currentFile === file;

          return (
            <div
              className={cn(
                "flex h-8 flex-[0_0_auto] cursor-pointer flex-row flex-nowrap items-center gap-[1ch] border bg-gray-100 p-[0.5rem_1ch] transition-colors hover:bg-gray-200",
                currentFile === file &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
              data-current={currentFile === file || undefined}
              key={file.name}
              onClick={() => openFile(file)}
            >
              <Code2 className="size-5" />
              <span className="text-sm">{file.name}</span>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  closeFile(file);
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
