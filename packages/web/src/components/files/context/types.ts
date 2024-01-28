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

export type Status = "initializing" | "loading" | "idle" | "error";

export type State<T> = {
  tree: TreeNode<T>[];
  status: Status;
  isDragging: boolean;
  selected: TreeNode<T> | undefined;
};

export type Action<T> =
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

export type Dispatch<T> = (action: Action<T>) => void;

export type FileTreeProviderProps = { children: React.ReactNode };
