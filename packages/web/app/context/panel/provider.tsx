import { useCallback, useMemo, useReducer } from "react";
import { PanelContext } from "./context";
import type { PanelFile, PanelState } from "./types";

type PanelProviderProps = {
  children: React.ReactNode;
};

type CloseAction = { type: "close"; file: PanelFile };
type OpenAction = { type: "open"; file: PanelFile };

export type FilesAction = CloseAction | OpenAction;

const initialState: PanelState = {
  currentFile: null,
  currentFileIndex: 0,
  files: [],
  openFiles: [],
  closeFile: () => {},
  openFile: () => {},
};

type PanelReducerState = Pick<
  PanelState,
  "currentFileIndex" | "files" | "openFiles"
>;

function panelReducer(
  state: PanelReducerState,
  action: FilesAction,
): PanelReducerState {
  switch (action.type) {
    case "close": {
      const { file } = action;
      const { currentFileIndex, openFiles } = state;

      const fileIndex = openFiles.findIndex(({ name }) => name === file.name);

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
      const fileIndex = openFiles.findIndex(({ name }) => name === file.name);
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

    default: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      throw `Unknown action type: ${(action as any).type}`;
    }
  }
}

function PanelProvider({ children }: PanelProviderProps) {
  const [_state, _dispatch] = useReducer(panelReducer, { ...initialState });

  const { currentFileIndex, openFiles } = _state;

  const currentFile = useMemo(() => {
    return openFiles[currentFileIndex] ?? null;
  }, [currentFileIndex, openFiles]);

  const closeFile = useCallback((file: PanelFile) => {
    _dispatch({ type: "close", file });
  }, []);

  const openFile = useCallback((file: PanelFile) => {
    _dispatch({ type: "open", file });
  }, []);

  const value: PanelState = useMemo(
    () => ({
      currentFile,
      closeFile,
      openFile,
      files: _state.files,
      openFiles: _state.openFiles,
      currentFileIndex,
    }),
    [
      _state.files,
      _state.openFiles,
      closeFile,
      currentFile,
      currentFileIndex,
      openFile,
    ],
  );

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

export { PanelProvider };
