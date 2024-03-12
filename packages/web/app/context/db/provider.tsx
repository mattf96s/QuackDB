import { useEffect, useMemo, useRef } from "react";
import { useSession } from "~/context/session/useSession";
import { DuckDBInstance } from "~/modules/duckdb-singleton";
import { type Dataset } from "~/types/files/dataset";
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
  // React docs recommend avoiding creating a new instance on every render (if expensive).
  // So rather use the if(db.current === null) pattern.
  // See: https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents

  /**
   * https://react.dev/learn/referencing-values-with-refs#best-practices-for-refs
   *
   * Don’t read or write ref.current during rendering. If some information is needed during rendering, use state instead.
   * Since React doesn’t know when ref.current changes, even reading it while rendering makes your component’s behavior difficult to predict.
   * (The only exception to this is code like if (!ref.current) ref.current = new Thing() which only sets the ref once during the first render.)
   *
   * i.e. the dbRef isn't used in the render (not displayed visually or used to calculate the next state), so it's safe to use a ref.
   */

  const db = useRef<DuckDBInstance | null>(null);
  const { sessionId, sources } = useSession();

  if (db.current === null) {
    // don't need to wait for first render to create the instance (and avoid creating a new instance on every render)
    db.current = new DuckDBInstance({
      session: sessionId,
    });
  }

  // cleanup on unmount (not session change)
  useEffect(() => {
    return () => {
      db.current
        ?.dispose()
        .catch((e) => console.error("Error disposing db: ", e));
    };
  }, []);

  // add sources to db
  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const addSources = async (sources: Dataset[]) => {
      try {
        for await (const source of sources) {
          if (signal.aborted) break;
          await db.current?.registerFileHandle(source.path, source.handle);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.error("Error adding sources: ", e);
      }
    };

    addSources(sources);

    return () => {
      abortController.abort();
    };
  }, [sources]);

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
