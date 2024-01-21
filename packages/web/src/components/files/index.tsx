import { cn } from "@/lib/utils";
import { useFileTree } from "./context";
import { useAddFilesHandler } from "./hooks/useOnAddFile";

export function FileTreeDropContainer(props: { children: React.ReactNode }) {
  const { dispatch, state } = useFileTree();
  const { addFilesWorkerFn } = useAddFilesHandler();

  const onDropHandler = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    dispatch({ type: "SET_STATUS", payload: { status: "loading" } });
    dispatch({ type: "IS_DRAGGING", payload: { isDragging: false } });

    const fileHandlesPromises = await Promise.all(
      [...e.dataTransfer.items]
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFileSystemHandle()),
    );

    const handles = fileHandlesPromises
      .filter((handle) => handle?.kind === "file")
      .filter(Boolean) as FileSystemFileHandle[];

    addFilesWorkerFn(handles);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "IS_DRAGGING", payload: { isDragging: true } });
    if (e.dataTransfer !== null) {
      e.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    dispatch({ type: "IS_DRAGGING", payload: { isDragging: false } });
  };

  return (
    <div
      className={cn(
        "flex-1 flex-grow",
        state.isDragging &&
          "max-h-full cursor-pointer rounded-xl outline-dashed -outline-offset-8 outline-blue-500",
      )}
      onDrop={onDropHandler}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className={cn("container max-w-none px-0")}>
        <div className={cn("flex-1 overflow-y-auto")}>{props.children}</div>
      </div>
    </div>
  );
}
