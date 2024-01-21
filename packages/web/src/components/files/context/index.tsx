import { wrap } from "comlink";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { toast } from "sonner";
import { type GetDirectoryFilesWorker } from "workers/get-directory-files";

export type TreeNode<T> = {
  id: string;
  name: string;
  data: T;
  children?: TreeNode<T>[];
};

export type TreeNodeData = {
  fileSize: number;
  fileType: string;
  handle: FileSystemFileHandle;
  lastModified: number;
};

type Status = "initializing" | "loading" | "idle" | "error";

type State<T> = {
  tree: TreeNode<T>[];
  status: Status;
  isDragging: boolean;
  selected: TreeNode<T> | undefined;
};

type Action<T> =
  | {
      type: "IS_DRAGGING";
      payload: {
        isDragging: boolean;
      };
    }
  | {
      type: "SET_TREE_STRUCTURE";
      payload: {
        tree: TreeNode<T>[];
      };
    }
  | {
      type: "SET_STATUS";
      payload: {
        status: Status;
      };
    }
  | {
      type: "SET_SELECTED";
      payload: {
        selected: TreeNode<T>;
      };
    }
  | {
      type: "UNSET_SELECTED";
    }
  | {
      type: "MERGE_TREE_STRUCTURE";
      payload: {
        tree: TreeNode<T>[];
      };
    };

type Dispatch<T> = (action: Action<T>) => void;

type FileTreeProviderProps = { children: React.ReactNode };

const FileTreeStateContext = createContext<
  | {
      state: State<TreeNodeData>;
      dispatch: Dispatch<TreeNodeData>;
      onRefreshFileTree: () => Promise<void>;
    }
  | undefined
>(undefined);

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

  const storedWorker = useMemo(
    () =>
      new Worker("/workers/get-directory-files.ts", {
        type: "module",
      }),
    [],
  );

  useEffect(() => {
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

    let worker = storedWorker;

    worker?.addEventListener("message", handleMessage);

    return () => {
      worker?.removeEventListener("message", handleMessage);
      worker?.terminate();
    };
  }, [storedWorker]);

  // useEffect(() => {
  // 	//if (workerRef.current) return

  // 	const handleMessage = (ev: MessageEvent) => {
  // 		const { data } = ev
  // 		const type = data?.type

  // 		if (!type) return

  // 		switch (type) {
  // 			case 'get-directory-tree-started': {
  // 				dispatch({
  // 					type: 'SET_STATUS',
  // 					payload: {
  // 						status: 'loading',
  // 					},
  // 				})
  // 				break
  // 			}
  // 			case 'get-directory-tree-complete': {
  // 				dispatch({
  // 					type: 'SET_STATUS',
  // 					payload: {
  // 						status: 'idle',
  // 					},
  // 				})
  // 				const { payload } = data
  // 				const tree = payload?.tree

  // 				dispatch({
  // 					type: 'SET_TREE_STRUCTURE',
  // 					payload: {
  // 						tree: tree,
  // 					},
  // 				})
  // 				break
  // 			}
  // 			case 'file-tree-error': {
  // 				dispatch({
  // 					type: 'SET_STATUS',
  // 					payload: {
  // 						status: 'idle',
  // 					},
  // 				})
  // 				const { payload } = data
  // 				const error = payload?.error
  // 				if (error) {
  // 					toast.warning('Error', {
  // 						description: error,
  // 					})
  // 				}
  // 				break
  // 			}
  // 			case 'aborted': {
  // 				dispatch({
  // 					type: 'SET_STATUS',
  // 					payload: {
  // 						status: 'idle',
  // 					},
  // 				})
  // 				break
  // 			}
  // 			default:
  // 				break
  // 		}
  // 	}

  // 	const worker = new Worker('/workers/get-directory-files.js', {
  // 		type: 'module',
  // 	})

  // 	worker.addEventListener('message', handleMessage)

  // 	const wrapper = wrap<FileTreeWorker>(worker)
  // 	wrapperRef.current = wrapper

  // 	return () => {
  // 		wrapper[releaseProxy]()
  // 		worker.removeEventListener('message', handleMessage)
  // 		worker.terminate()
  // 	}
  // }, [])

  const onRefreshFileTree = useCallback(async () => {
    if (!storedWorker) {
      console.error("onRefreshFileTree failure: storedWorker is undefined");
      return;
    }

    const getFiles = wrap<GetDirectoryFilesWorker>(storedWorker);
    await getFiles();
  }, [storedWorker]);

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

function useFileTree() {
  const context = useContext(FileTreeStateContext);

  if (context === undefined) {
    throw new Error("useFileTree must be used within a FileTreeProvider");
  }
  return context;
}

export { FileTreeProvider, useFileTree };
