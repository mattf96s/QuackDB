import { z } from "zod";
import type { ResultColumn } from "./utils/arrow/helpers";

// ----------- App ------------ //

export const prodDomain = "app.quackdb.com";

// ----------- Query ------------ //

/**
 * IndexedDB cache (accessed through idb-keyval).
 */
export const IDB_KEYS = {
  QUERY_HISTORY: "query-history", // the actual SQL query runs
};

/**
 * Caches API keys.
 */
export const CACHE_KEYS = {
  QUERY_RESULTS: "query-result", // the result of the SQL query for caching in caches.
};

export const LOCAL_STORAGE_KEYS = {};

export const sidebarWidth = 20;

// ----------- File System ------------ //

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

// ----------- Query ------------ //

/**
 * Query meta Zod schema
 */
export const queryMetaSchema = z.object({
  cacheHit: z.boolean(),
  executionTime: z.number(),
  sql: z.string(),
  error: z.string().nullable(),
  status: z.enum(["IDLE", "SUCCESS", "ERROR", "CANCELLED"]),
  hash: z.string(),
  created: z.string().datetime(),
});

/**
 * Store metadata about the query execution (WIP)
 */
export type QueryMeta = z.infer<typeof queryMetaSchema>;

/**
 * Return type for the fetchResults function in the DuckDB singleton.
 */
export type FetchResultsReturn = {
  rows: Record<string, unknown>[];
  schema: ResultColumn[];
  meta: QueryMeta | undefined;
  count: number;
};
