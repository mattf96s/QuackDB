import { useCallback, useRef } from "react";

/**
 * Imperatively abort async functions;
 *
 * Source: [Kent Dodds](https://gist.github.com/kentcdodds/b36572b6e9227207e6c71fd80e63f3b4)
 * 
 * @example
   
    const { getSignal, abortSignal } = useAbortController();

    const onRunQuery = useCallback(
        async (sql: string) => {
    
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
                
            } catch (e) {
                if (e instanceof DOMException && e.name === "AbortError") {
                    // We aborted the query
            }
      }
    },
    [db, getSignal],
  );

 */
export default function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const getAbortController = useCallback(() => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current;
  }, []);

  const abortSignal = useCallback((reason?: unknown) => {
    // if we don't have a current abort controller, then we don't have a current signal either...
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(reason);
      abortControllerRef.current = null; // Resets it for next time
    }
  }, []);

  const getSignal = useCallback(
    () => getAbortController().signal,
    [getAbortController],
  );

  return { getSignal, abortSignal };
}
