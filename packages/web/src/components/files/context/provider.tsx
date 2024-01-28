import { useCallback, useEffect, useMemo, useReducer } from "react";
import { wrap } from "comlink";
import { toast } from "sonner";
import { type GetDirectoryFilesWorker } from "@/workers/get-directory-files";
import { FileTreeStateContext } from "./context";
import type {
  Action,
  FileTreeProviderProps,
  State,
  TreeNodeData,
} from "./types";

function fileHandleReducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case "SET_STATUS": {
      const { status } = action.payload;
      return { ...state, status };
    }

    case "SET_TREE_STRUCTURE": {
      const { tree } = action.payload;
      return { ...state, tree };
    }

    case "MERGE_TREE_STRUCTURE": {
      const { tree } = action.payload;
      const mergedTree = [...state.tree, ...tree];
      return { ...state, tree: mergedTree };
    }

    case "IS_DRAGGING": {
      const { isDragging } = action.payload;
      return { ...state, isDragging };
    }

    case "SET_SELECTED": {
      const { selected } = action.payload;
      return { ...state, selected };
    }

    case "UNSET_SELECTED": {
      return { ...state, selected: undefined };
    }

    default: {
      return { ...state };
    }
  }
}

const initialHandleState: State<TreeNodeData> = {
  tree: [],
  status: "initializing",
  isDragging: false,
  selected: undefined,
};

function FileTreeProvider(props: FileTreeProviderProps) {
  const [state, dispatch] = useReducer(fileHandleReducer<TreeNodeData>, {
    ...initialHandleState,
  });

  const storedWorker = useMemo(() => {
    return new Worker(
      new URL("@/workers/get-directory-files.ts", import.meta.url).href,
      {
        type: "module",
      },
    );
  }, []);

  useEffect(() => {
    if (state.status === "initializing") return;
    const handleMessage = (ev: MessageEvent) => {
      const { data } = ev;
      const type = data?.type;

      if (!type) return;

      switch (type) {
        case "start": {
          dispatch({
            type: "SET_STATUS",
            payload: {
              status: "loading",
            },
          });
          break;
        }

        case "complete": {
          const { payload } = data;
          const tree = payload?.tree;

          dispatch({
            type: "SET_STATUS",
            payload: {
              status: "idle",
            },
          });
          dispatch({
            type: "SET_TREE_STRUCTURE",
            payload: {
              tree: tree,
            },
          });
          break;
        }
        case "error": {
          dispatch({
            type: "SET_STATUS",
            payload: {
              status: "idle",
            },
          });
          const { payload } = data;
          const error = payload?.error;
          if (error) {
            toast.warning("Error", {
              description: error,
            });
          }
          break;
        }
        case "IS_READY": {
          break;
        }
        // Internal Comlink thing (I think)
        case "RAW": {
          break;
        }

        default: {
          console.debug("Unknown message type in FileTreeProvider: ", type);
          break;
        }
      }
    };

    const worker = storedWorker;

    worker?.addEventListener("message", handleMessage);

    return () => {
      worker?.removeEventListener("message", handleMessage);
      worker?.terminate();
    };
  }, [state.status, storedWorker]);

  const onRefreshFileTree = useCallback(async () => {
    console.log("onRefreshFileTree: Start");
    dispatch({
      type: "SET_STATUS",
      payload: {
        status: "loading",
      },
    });
    const worker = new Worker(
      new URL("@/workers/get-directory-files.ts", import.meta.url).href,
      {
        type: "module",
      },
    );

    const getFilesFn = wrap<GetDirectoryFilesWorker>(worker);
    try {
      const res = await getFilesFn();
      if (res?.tree === undefined) throw new Error("Failed to get tree");
      dispatch({
        type: "SET_TREE_STRUCTURE",
        payload: {
          tree: res.tree,
        },
      });
      dispatch({
        type: "SET_STATUS",
        payload: {
          status: "idle",
        },
      });
    } catch (e) {
      console.error(e);
      dispatch({
        type: "SET_STATUS",
        payload: {
          status: "idle",
        },
      });
    }
  }, []);

  const value = useMemo(
    () => ({ state, dispatch, onRefreshFileTree }),
    [state, dispatch, onRefreshFileTree],
  );
  return (
    <FileTreeStateContext.Provider value={value}>
      {props.children}
    </FileTreeStateContext.Provider>
  );
}

export { FileTreeProvider };
