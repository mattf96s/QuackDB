import { useCallback, useReducer, useRef } from "react";
import { toast } from "sonner";
import type { AddDataSourceProps } from "../../types";
import { useSession } from "../../useSession";

type State = {
  isDragActive: boolean;
};

type Action =
  | { type: "DRAG_OVER" }
  | { type: "DRAG_ENTER" }
  | { type: "DRAG_LEAVE" }
  | { type: "DROP" };

const initialState: State = {
  isDragActive: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "DRAG_ENTER":
      return { ...state, isDragActive: true };
    case "DRAG_LEAVE":
      return { ...state, isDragActive: false };
    case "DRAG_OVER":
      return { ...state, isDragActive: true };
    case "DROP":
      return { ...state, isDragActive: false };
    default:
      return state;
  }
}

type DropEvent =
  | React.DragEvent<HTMLElement>
  | React.ChangeEvent<HTMLInputElement>
  | DragEvent
  | Event;

function isEvtWithFiles(event: DropEvent) {
  if (!("dataTransfer" in event && event.dataTransfer !== null)) {
    return !!event.target && "files" in event.target && !!event.target.files;
  }
  // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
  return Array.prototype.some.call(
    event.dataTransfer.types,
    (type) => type === "Files" || type === "application/x-moz-file",
  );
}

const useDropZone = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const hasFiles = isEvtWithFiles(e);
    if (!hasFiles) return;

    if ("dataTransfer" in e && e.dataTransfer !== null) {
      try {
        e.dataTransfer.dropEffect = "copy";
      } catch {} /* eslint-disable-line no-empty */
    }

    dispatch({ type: "DRAG_OVER" });
  }, []);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dispatch({ type: "DRAG_ENTER" });
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dispatch({ type: "DRAG_LEAVE" });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, cb: (files: FileList) => void) => {
      e.preventDefault();

      if (!isEvtWithFiles(e)) {
        toast.warning("No files found");
        dispatch({ type: "DROP" });
      }

      const files =
        "dataTransfer" in e && e.dataTransfer !== null
          ? e.dataTransfer.files
          : (e.target as HTMLInputElement).files;

      dispatch({ type: "DROP" });
      if (files) return cb(files);
      return null;
    },
    [],
  );

  return {
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    isDragActive: state.isDragActive,
  };
};

export const useFileDrop = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { onDragOver, onDragEnter, onDragLeave, onDrop, isDragActive } =
    useDropZone();
  const { onAddDataSources } = useSession();

  // Process all of the items.
  const onFileDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      return onDrop(e, async (files) => {
        const sources: AddDataSourceProps = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file) return;
          sources.push({
            filename: file.name,
            type: "FILE",
            entry: file,
          });
        }

        await onAddDataSources(sources);
      });
      //   e.preventDefault();
      //   const items = e.dataTransfer.items;

      //   const sources: FileSystemFileEntry[] = [];

      //   for (let i = 0; i < items.length; i++) {
      //     const item = items[i];
      //     if (!item) continue;

      //     if (item.kind === "file") {
      //       // Only chrome supports getAsFileSystemHandle() so rather use webkitGetAsEntry() for now.
      //       const entry = item.webkitGetAsEntry();
      //       if (!entry) continue;

      //       if (fileIsFileEntry(entry)) {
      //         sources.push(entry);
      //       }
      //     }
      //   }
    },
    [onDrop, onAddDataSources],
  );

  return {
    ref,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    isDragActive,
    onFileDrop,
  };
};
