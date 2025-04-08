import type { DuckDBInstance } from "@/modules/duckdb-singleton";

export type DBState = {
  db: DuckDBInstance | null;
};
