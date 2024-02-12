import { useCallback, useMemo, useReducer } from "react";
import { useDB } from "@/context/db/useDB";
import useAbortController from "@/hooks/use-abortable";
import type { FetchResultsReturn } from "@/modules/duckdb-singleton";
import { QueryContext } from "./context";
import type { QueryState } from "./types";

type QueryProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

type State = Pick<QueryState, "rows" | "schema" | "status" | "error" | "sql">;
type Action =
  | {
      type: "QUERY_START";
      payload: {
        sql: string;
      };
    }
  | {
      type: "QUERY_SUCCESS";
      payload: {
        rows: QueryState["rows"];
        schema: QueryState["schema"];
      };
    }
  | {
      type: "QUERY_ERROR";
      paylod: {
        error: string;
      };
    };

function queryReducer(state: State, action: Action): State {
  switch (action.type) {
    case "QUERY_START": {
      return {
        ...state,
        error: null,
        sql: action.payload.sql,
        status: "loading",
      };
    }
    case "QUERY_SUCCESS": {
      return {
        ...state,
        status: "idle",
        rows: action.payload.rows,
        schema: action.payload.schema,
      };
    }
    case "QUERY_ERROR": {
      return {
        ...state,
        status: "error",
        error: action.paylod.error,
        rows: [],
        schema: [],
      };
    }
    default:
      return { ...state };
  }
}

/**
 * Context for the query results;
 *
 */
function QueryProvider({ children }: QueryProviderProps) {
  const [state, dispatch] = useReducer(queryReducer, {
    status: "idle",
    rows: [],
    schema: [],
    error: null,
    sql: "",
  });

  // abort controller which we can control imperatively
  const { abortSignal, getSignal } = useAbortController();

  const { db } = useDB();

  const onRunQuery = useCallback(
    async (sql: string) => {
      if (!db) return;

      dispatch({ type: "QUERY_START", payload: { sql } });
      try {
        const signal = getSignal();
        const doQuery = db.fetchResults({ query: sql });

        const isCancelledPromise = new Promise((_, reject) => {
          signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        const results = await Promise.race([doQuery, isCancelledPromise]);

        const { rows, schema } = results as FetchResultsReturn;

        dispatch({ type: "QUERY_SUCCESS", payload: { rows, schema } });
      } catch (error) {
        console.error("Error running query: ", error);
        const message =
          error instanceof Error ? error.message : "Unknown error";
        dispatch({ type: "QUERY_ERROR", paylod: { error: message } });
      }
    },
    [db, getSignal],
  );

  const onCancelQuery = useCallback(
    (reason: string) => {
      abortSignal(reason);
      dispatch({ type: "QUERY_ERROR", paylod: { error: reason } });
    },
    [abortSignal],
  );

  const value = useMemo(
    () => ({
      ...state,
      onRunQuery,
      onCancelQuery,
    }),
    [onCancelQuery, onRunQuery, state],
  );
  return (
    <QueryContext.Provider value={value}>{children}</QueryContext.Provider>
  );
}

export { QueryProvider };
