export type PanelFile = {
  code: string;
  language: "sql" | "json" | "csv" | "parquet";
  fileName: string;
  path: string[];
};

export type ResultsViewProps = {
  sql: string;
  currentFile: PanelFile;
  isEditorFocused: boolean;
};
