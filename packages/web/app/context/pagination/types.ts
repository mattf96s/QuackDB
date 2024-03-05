export type PaginationState = {
  count: number;
  limit: number;
  offset: number;
  canGoNext: boolean;
  canGoPrev: boolean;
};

export type PaginationContextValue = PaginationState & {
  goToFirstPage: () => void;
  goToLastPage: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  goToPage: (page: number) => void;
  onLimitChange: (value: number) => void;
  onSetCount: (value: number) => void;
};

export type PaginationActions =
  | {
      type: "SET_LIMIT";
      payload: number;
    }
  | {
      type: "SET_OFFSET";
      payload: number;
    }
  | {
      type: "SET_COUNT";
      payload: number;
    }
  | {
      type: "GO_TO_FIRST_PAGE";
    }
  | {
      type: "GO_TO_LAST_PAGE";
    }
  | {
      type: "GO_TO_PAGE";
      payload: number;
    }
  | {
      type: "ON_NEXT_PAGE";
    }
  | {
      type: "ON_PREV_PAGE";
    };
