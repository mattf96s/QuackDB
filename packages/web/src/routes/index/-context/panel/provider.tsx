import { useCallback, useMemo, useReducer } from "react";
import { PanelContext } from "./context";
import type { PanelFile, PanelState } from "./types";

type PanelProviderProps = {
  children: React.ReactNode;
};

type CloseAction = { type: "close"; file: PanelFile };
type OpenAction = { type: "open"; file: PanelFile };
type ToggleCollapsedAction = { type: "toggleCollapsed"; collapsed: boolean };

export type FilesAction = CloseAction | OpenAction | ToggleCollapsedAction;

const initialState: PanelState = {
  currentFileIndex: 0,
  fileListIsCollapsed: false,
  files: [],
  openFiles: [],
};

function panelReducer(state: PanelState, action: FilesAction): PanelState {
  switch (action.type) {
    case "close": {
      const { file } = action;
      const { currentFileIndex, openFiles } = state;

      const fileIndex = openFiles.findIndex(
        ({ fileName }) => fileName === file.fileName,
      );
      if (fileIndex === -1) {
        // File not open; this shouldn't happen.
        return state;
      }

      const newOpenFiles = openFiles.concat();
      newOpenFiles.splice(fileIndex, 1);

      let newCurrentFileIndex = currentFileIndex;
      if (newCurrentFileIndex >= newOpenFiles.length) {
        newCurrentFileIndex = newOpenFiles.length - 1;
      }

      return {
        ...state,
        currentFileIndex: newCurrentFileIndex,
        openFiles: newOpenFiles,
      };
    }
    case "open": {
      const { file } = action;
      const { openFiles } = state;
      const fileIndex = openFiles.findIndex(
        ({ fileName }) => fileName === file.fileName,
      );
      if (fileIndex >= 0) {
        return {
          ...state,
          currentFileIndex: fileIndex,
        };
      } else {
        const newOpenFiles = [...openFiles, file];

        return {
          ...state,
          currentFileIndex: openFiles.length,
          openFiles: newOpenFiles,
        };
      }
    }
    case "toggleCollapsed": {
      return { ...state, fileListIsCollapsed: action.collapsed };
    }

    default: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw `Unknown action type: ${(action as any).type}`;
    }
  }
}

function PanelProvider({ children }: PanelProviderProps) {
  const [_state, _dispatch] = useReducer(panelReducer, { ...initialState });

  const { currentFileIndex, fileListIsCollapsed, openFiles } = _state;

  const currentFile = useMemo(() => {
    return openFiles[currentFileIndex] ?? null;
  }, [currentFileIndex, openFiles]);

  const closeFile = useCallback((file: PanelFile) => {
    _dispatch({ type: "close", file });
  }, []);

  const openFile = useCallback((file: PanelFile) => {
    _dispatch({ type: "open", file });
  }, []);

  const onNewFile = useCallback(() => {}, []);

  const onCollapse = useCallback(() => {
    _dispatch({ type: "toggleCollapsed", collapsed: true });
  }, []);

  const onExpand = useCallback(() => {
    _dispatch({ type: "toggleCollapsed", collapsed: false });
  }, []);

  const value: PanelState = useMemo(
    () => ({
      currentFile,
      fileListIsCollapsed,
      closeFile,
      openFile,
      onCollapse,
      onExpand,
      files: _state.files,
      openFiles: [],
      currentFileIndex,
    }),
    [
      _state.files,
      closeFile,
      currentFile,
      currentFileIndex,
      fileListIsCollapsed,
      onCollapse,
      onExpand,
      openFile,
    ],
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

export { PanelProvider };
