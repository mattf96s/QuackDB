export type PanelFile = {
  name: string;
  handle: FileSystemFileHandle;
};

export type PanelState = {
  currentFile: PanelFile | null;
  files: PanelFile[];
  openFiles: PanelFile[];
  currentFileIndex: number;
  closeFile: (file: PanelFile) => void;
  openFile: (file: PanelFile) => void;
};
