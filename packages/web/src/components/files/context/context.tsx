import { createContext } from "react";
import type { Dispatch, State, TreeNodeData } from "./types";

export const FileTreeStateContext = createContext<
  | {
      state: State<TreeNodeData>;
      dispatch: Dispatch<TreeNodeData>;
      onRefreshFileTree: () => Promise<void>;
    }
  | undefined
>(undefined);
