import type { FetchResultsReturn } from "@/modules/duckdb-singleton";

export type QueryState = FetchResultsReturn & {
  status: "idle" | "loading" | "error";
  error: null | string;
  sql: string;
  onRunQuery: (sql: string) => Promise<void>;
  onCancelQuery: (reason: string) => void;
};
