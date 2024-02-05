import { useEffect, useMemo, useRef } from "react";
import { DuckDBInstance } from "@/modules/duckdb-singleton";
import { DBStateContext } from "./context";
import type { DBProviderProps } from "./types";

function DBProvider(props: DBProviderProps) {
  const dbSingleton = useRef<DuckDBInstance>(new DuckDBInstance());

  useEffect(() => {
    const db = dbSingleton.current;
    return () => {
      db.dispose();
    };
  }, [dbSingleton]);

  const value = useMemo(() => {
    return {
      db: dbSingleton.current,
    };
  }, [dbSingleton]);

  return (
    <DBStateContext.Provider value={value}>
      {props.children}
    </DBStateContext.Provider>
  );
}

export { DBProvider };
