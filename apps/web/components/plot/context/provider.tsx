import type { ResultColumn } from "@/utils/arrow/helpers";
import { useMemo, useReducer } from "react";
import { ChartContext } from "./context";
import type { ChartAction, ChartState } from "./types";

type ChartProviderProps = { children: React.ReactNode };

// Breakup everything into smaller files because of React Fast Refresh limitations.

function chartReducer(state: ChartState, action: ChartAction): ChartState {
  switch (action.type) {
    case "INITIALIZE": {
      return getOptions(action.payload.data);
    }
    case "SET_X":
      return { ...state, x: action.payload.x };
    case "SET_Y":
      return { ...state, y: action.payload.y };
    case "SET_COLOR":
      return { ...state, color: action.payload.color };
    case "SET_MARK":
      return { ...state, mark: action.payload.mark };
    case "SET_DATA":
      return { ...state, data: action.payload.data ?? [] };
    case "SET_COLUMNS":
      return { ...state, columns: action.payload.columns ?? [] };
    case "SET_SCHEME":
      return { ...state, scheme: action.payload.scheme };
    case "RESET":
      return { ...initialChartState };
    default:
      return { ...state };
  }
}

const initialChartState: ChartState = {
  x: undefined,
  y: undefined,
  color: undefined,
  mark: "bar",
  data: [],
  columns: [],
  scheme: "Category10",
  _dispatch: () => {},
};

function getOptions(data: {
  rows: unknown[];
  columns: ResultColumn[];
}): ChartState {
  const { rows, columns } = data;

  if (rows.length === 0 && columns.length === 0)
    return { ...initialChartState };

  // find most likely x column
  let xColumn = columns.find((column) => column.type === "date");

  if (!xColumn && columns.length > 0) {
    // find first number column
    xColumn = columns.find(
      (column) => column.type === "number" || column.type === "integer"
    );

    // if no number column, use first column
    if (!xColumn) {
      xColumn = columns[0];
    }
  }

  // find most likely y column
  const remainingColumns = columns.filter((col) => col.name !== xColumn?.name);

  let yColumn = remainingColumns.find(
    (column) => column.type === "number" || column.type === "integer"
  );

  if (!yColumn && remainingColumns.length > 0) {
    // use first column
    yColumn = remainingColumns[0];
  }

  if (!xColumn && !yColumn) {
    console.error("No suitable columns found for x and y axis: ");
    return { ...initialChartState };
  }

  return {
    ...initialChartState,
    x: xColumn?.name ?? undefined,
    y: yColumn?.name ?? undefined,
    data: rows,
    columns,
  };
}

/**
 * Context for the query results;
 *
 */
function ChartProvider(props: ChartProviderProps) {
  const [state, _dispatch] = useReducer(chartReducer, initialChartState);

  const value: ChartState = useMemo(
    () => ({
      ...state,
      _dispatch,
    }),
    [state]
  );

  return (
    <ChartContext.Provider value={value}>
      {props.children}
    </ChartContext.Provider>
  );
}

export { ChartProvider };
