export type PanelFile = {
  code: string;
  language: "sql" | "json" | "csv" | "parquet";
  fileName: string;
  path: string[];
};

export type PanelState = {
  files: PanelFile[];
  openFiles: PanelFile[];
  currentFileIndex: number;
  fileListIsCollapsed: boolean;
};
