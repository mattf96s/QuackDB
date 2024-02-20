export const CACHE_KEYS = {
  QUERY_HISTORY: "query-history",
  SQL_EDITOR_CONTENT: "sql-editor-content",
  THEME: "theme",
};

export const sidebarWidth = 20;

export type SourceFileExt =
  | "csv"
  | "json"
  | "txt"
  | "duckdb"
  | "sqlite"
  | "postgresql"
  | "parquet"
  | "arrow"
  | "excel"
  | "url";

export const sourceFileTypes: SourceFileExt[] = [
  "csv",
  "json",
  "txt",
  "duckdb",
  "sqlite",
  "postgresql",
  "parquet",
  "arrow",
  "excel",
  "url",
];

export type DatasetMimeType =
  | "text/csv"
  | "application/json"
  | "text/plain"
  | "application/duckdb"
  | "application/sqlite"
  | "application/postgresql"
  | "application/parquet"
  | "application/arrow"
  | "application/excel"
  | "text/x-uri";

export const extToSourceMimeType: Record<SourceFileExt, DatasetMimeType> = {
  csv: "text/csv",
  json: "application/json",
  txt: "text/plain",
  duckdb: "application/duckdb",
  sqlite: "application/sqlite",
  postgresql: "application/postgresql",
  parquet: "application/parquet",
  arrow: "application/arrow",
  excel: "application/excel",
  url: "text/x-uri", // remote sources
};

export type EditorMimeType =
  | "text/sql"
  | "text/javascript"
  | "text/python"
  | "text/typescript"
  | "text/rust";

export type MimeType = DatasetMimeType | EditorMimeType;

export type FileKind = "SOURCE" | "EDITOR";

export type CodeFileExt = "sql" | "js" | "py" | "ts" | "rs";

export const editorFileExtensions: CodeFileExt[] = [
  "sql",
  "js",
  "py",
  "ts",
  "rs",
];

export const extToEditorMimeType: Record<CodeFileExt, EditorMimeType> = {
  sql: "text/sql",
  js: "text/javascript",
  py: "text/python",
  ts: "text/typescript",
  rs: "text/rust",
};

type FileEntryBase = {
  path: string;
  handle: FileSystemFileHandle;
};

export type FileEntry<T extends FileKind> = T extends "SOURCE"
  ? FileEntryBase & {
      kind: T;
      mimeType: DatasetMimeType;
      ext: SourceFileExt;
    }
  : FileEntryBase & {
      kind: T;
      mimeType: EditorMimeType;
      ext: CodeFileExt;
    };

export type Source = FileEntry<"SOURCE">;
export type Editor = FileEntry<"EDITOR">;
