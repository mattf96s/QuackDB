import { useCallback, useMemo, useReducer } from "react";
import { PaginationContext } from "./context";
import type {
  PaginationActions,
  PaginationContextValue,
  PaginationState,
} from "./types";

type PaginationProviderProps = { children: React.ReactNode };

function paginationReducer(
  state: PaginationState,
  action: PaginationActions,
): PaginationState {
  switch (action.type) {
    // Initialize the pagination state
    case "SET_COUNT": {
      return {
        ...state,
        count: action.payload,
        offset: 0,
        canGoNext: action.payload > state.limit,
        canGoPrev: false,
      };
    }
    case "SET_LIMIT": {
      // also reset the offset when limit changes
      return {
        ...state,
        limit: action.payload,
        offset: 0,
        canGoNext: state.offset + action.payload < state.count,
        canGoPrev: state.offset > 0,
      };
    }
    case "SET_OFFSET": {
      return {
        ...state,
        offset: action.payload,
        canGoNext: action.payload + state.limit < state.count,
        canGoPrev: action.payload > 0,
      };
    }

    case "GO_TO_FIRST_PAGE": {
      return {
        ...state,
        offset: 0,
        canGoNext: state.limit < state.count,
        canGoPrev: false,
      };
    }

    case "GO_TO_LAST_PAGE": {
      return {
        ...state,
        offset: state.count - state.limit,
        canGoNext: false,
        canGoPrev: true,
      };
    }

    case "GO_TO_PAGE": {
      return {
        ...state,
        offset: action.payload * state.limit,
        canGoNext: action.payload * state.limit + state.limit < state.count,
        canGoPrev: action.payload > 0,
      };
    }
    case "ON_NEXT_PAGE": {
      return {
        ...state,
        offset: state.offset + state.limit,
        canGoNext: state.offset + state.limit + state.limit < state.count,
        canGoPrev: state.offset + state.limit > 0,
      };
    }
    case "ON_PREV_PAGE": {
      return {
        ...state,
        offset: state.offset - state.limit,
        canGoNext: state.offset - state.limit + state.limit < state.count,
        canGoPrev: state.offset - state.limit > 0,
      };
    }
    default: {
      return { ...state };
    }
  }
}

const initialState: PaginationState = {
  count: 0,
  limit: 25,
  offset: 0,
  canGoNext: false,
  canGoPrev: false,
};

/**
 * Context provider for pagination
 */
function PaginationProvider(props: PaginationProviderProps) {
  const [state, dispatch] = useReducer(paginationReducer, { ...initialState });

  const goToFirstPage = useCallback(
    () => dispatch({ type: "GO_TO_FIRST_PAGE" }),
    [],
  );
  const goToLastPage = useCallback(
    () => dispatch({ type: "GO_TO_LAST_PAGE" }),
    [],
  );
  const goToPage = useCallback(
    (page: number) => dispatch({ type: "GO_TO_PAGE", payload: page }),
    [],
  );
  const onLimitChange = useCallback(
    (value: number) => dispatch({ type: "SET_LIMIT", payload: value }),
    [],
  );
  const onNextPage = useCallback(() => dispatch({ type: "ON_NEXT_PAGE" }), []);
  const onPrevPage = useCallback(() => dispatch({ type: "ON_PREV_PAGE" }), []);

  const onSetCount = useCallback(
    (count: number) => dispatch({ type: "SET_COUNT", payload: count }),
    [],
  );

  const value: PaginationContextValue = useMemo(
    () => ({
      ...state,
      goToFirstPage,
      goToLastPage,
      goToPage,
      onLimitChange,
      onNextPage,
      onPrevPage,
      onSetCount,
    }),
    [
      goToFirstPage,
      goToLastPage,
      goToPage,
      onLimitChange,
      onNextPage,
      onPrevPage,
      state,
      onSetCount,
    ],
  );
  return (
    <PaginationContext.Provider value={value}>
      {props.children}
    </PaginationContext.Provider>
  );
}

export { PaginationProvider };
