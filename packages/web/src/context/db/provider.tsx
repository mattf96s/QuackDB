import { useEffect, useMemo, useRef } from "react";
import { DuckDBInstance } from "@/modules/duckdb-singleton";
import { DBContext } from "./context";

type DBProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

/**
 * Context for the DuckDB instance.
 *
 * We want to create a single instance of DuckDB and share it across the app.
 * Rather create as many connections to the DB as needed.
 */
function DbProvider(props: DBProviderProps) {
  const db = useRef<DuckDBInstance | null>(null);

  if (db.current === null) {
    db.current = new DuckDBInstance();
  }

  // initialization and cleanup
  useEffect(() => {
    return () => {
      db?.current?.dispose();
    };
  }, []);

  const value = useMemo(
    () => ({
      db: db.current,
    }),
    [],
  );
  return (
    <DBContext.Provider value={value}>{props.children}</DBContext.Provider>
  );
}

export { DbProvider };
