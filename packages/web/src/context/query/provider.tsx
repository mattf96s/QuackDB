import {
  IDB_KEYS,
  queryMetaSchema,
  type FetchResultsReturn,
  type QueryMeta,
} from "@/constants";
import { useDB } from "@/context/db/useDB";
import useAbortController from "@/hooks/use-abortable";
import { get, set } from "idb-keyval";
import { useCallback, useMemo, useReducer } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { QueryContext } from "./context";
import type { QueryContextValue, QueryState } from "./types";

type QueryProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

type QueryAction =
  | {
      type: "RUN_START";
      payload: {
        sql: string;
      };
    }
  | {
      type: "RUN_STOP";
      payload: FetchResultsReturn;
    };

function queryReducer(state: QueryState, action: QueryAction): QueryState {
  switch (action.type) {
    case "RUN_START": {
      return {
        ...state,
        ...action.payload,
        status: "RUNNING",
      };
    }
    case "RUN_STOP": {
      return {
        ...state,
        ...action.payload,
        status: "IDLE",
      };
    }
    default:
      return { ...state };
  }
}

const initialState: QueryState = {
  sql: "",
  status: "IDLE",
  rows: [],
  schema: [],
  meta: undefined,
  count: 0,
};

async function onStoreRun(payload: FetchResultsReturn) {
  try {
    const newRunValidation = queryMetaSchema.safeParse(payload.meta);
    if (!newRunValidation.success) return;

    const runs: QueryMeta[] = [];

    const history = await get(IDB_KEYS.QUERY_HISTORY);

    if (history) {
      try {
        const parsed = JSON.parse(history);
        const validated = z.array(queryMetaSchema).safeParse(parsed);
        if (validated.success) {
          runs.push(...validated.data);
        }
      } catch (e) {
        console.error("Failed to parse query history", e);
      }
    }

    // check if the query is already in the history or if the length is greater than 100
    const exists = runs.find(
      (r) =>
        r.hash === newRunValidation.data.hash &&
        r.created === newRunValidation.data.created,
    );
    if (exists) return;

    if (runs.length > 100) {
      runs.pop();
    }

    const newRuns = [{ ...newRunValidation.data }, ...runs];

    await set(IDB_KEYS.QUERY_HISTORY, JSON.stringify(newRuns));
  } catch (e) {
    console.error("Failed to save SQL run: ", e);
  }
}

/**
 * Context for the query results;
 *
 */
function QueryProvider(props: QueryProviderProps) {
  const [state, dispatch] = useReducer(queryReducer, {
    ...initialState,
  });

  // abort controller which we can control imperatively
  const { abortSignal, getSignal } = useAbortController();

  const { db } = useDB();

  const onRunQuery = useCallback(
    async (sql: string) => {
      if (!db) {
        console.error("Run failed: db not ready yet");
        toast.warning("Run failed: db not ready yet");
        return;
      }

      dispatch({ type: "RUN_START", payload: { sql } });
      try {
        const signal = getSignal();
        const doQuery = db.fetchResults({ query: sql });

        // Only a user abort will throw an error. The response contains the error message if there is one.
        const isCancelledPromise = new Promise((_, reject) => {
          signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });

        const results = await Promise.race([doQuery, isCancelledPromise]);

        const payload = results as FetchResultsReturn;

        // store the query in indexeddb
        await onStoreRun(payload);

        dispatch({
          type: "RUN_STOP",
          payload,
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          // query was cancelled (not sure whether we should add this to the query history or not...)
          dispatch({ type: "RUN_STOP", payload: initialState });
          return;
        }
      }
    },
    [db, getSignal],
  );

  const onCancelQuery = useCallback(
    (reason: string) => {
      abortSignal(reason);
      dispatch({
        type: "RUN_STOP",
        payload: {
          count: 0,
          rows: [],
          schema: [],
          meta: undefined,
        },
      });
    },
    [abortSignal],
  );

  const value: QueryContextValue = useMemo(
    () => ({
      ...state,
      onRunQuery,
      onCancelQuery,
    }),
    [onCancelQuery, onRunQuery, state],
  );
  return (
    <QueryContext.Provider value={value}>
      {props.children}
    </QueryContext.Provider>
  );
}

export { QueryProvider };
