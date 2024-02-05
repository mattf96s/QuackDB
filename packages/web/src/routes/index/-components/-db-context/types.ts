import type { DuckDBInstance } from "@/modules/duckdb-singleton";

export type DBState = { db: DuckDBInstance };

export type DBProviderProps = { children: React.ReactNode };
