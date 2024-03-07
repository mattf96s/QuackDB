import type { FetchResultsReturn } from "~/constants.client";

/**
 * The state of the query context.
 *
 * Note: the status in the top level of the state is used to determine if the query is running or not.
 * The status in the meta is used to determine if the query was successful or not.
 */
export type QueryState = FetchResultsReturn & {
  status: "IDLE" | "RUNNING";
  sql: string;
};

export type QueryMethods = {
  onRunQuery: (sql: string) => Promise<void>;
  onCancelQuery: (reason: string) => void;
};

export type QueryContextValue = QueryState & QueryMethods;
