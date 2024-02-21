import { useEffect, useReducer, useRef } from "react";
import * as Plot from "@observablehq/plot";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ResultColumn } from "@/utils/arrow/helpers";
import PlotSettings from "./components/settings";

type ChartProps = {
  data: {
    rows: unknown[];
    columns: ResultColumn[];
  };
  containerClassName?: React.HTMLProps<HTMLDivElement>["className"];
  chartProps?: Plot.AutoOptions;
};

type ChartState = Pick<Plot.AutoOptions, "x" | "y" | "color" | "mark"> & {
  data: Plot.Data;
  columns: ResultColumn[];
  scheme: Plot.ScaleOptions["scheme"];
};

type ChartAction =
  | {
      type:
        | "SET_X"
        | "SET_Y"
        | "SET_COLOR"
        | "SET_MARK"
        | "SET_DATA"
        | "SET_COLUMNS";
      payload: Partial<ChartState>;
    }
  | {
      type: "RESET";
    }
  | {
      type: "INITIALIZE";
      payload: {
        data: { rows: unknown[]; columns: ResultColumn[] };
        options: Plot.AutoOptions;
      };
    }
  | {
      type: "SET_SCHEME";
      payload: {
        scheme: Plot.ScaleOptions["scheme"];
      };
    };

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
  x: { value: null, reduce: "count", zero: true },
  y: { value: null, reduce: "count", zero: true },
  color: undefined,
  mark: "bar",
  data: [],
  columns: [],
  scheme: undefined,
};

function getAutoSpec(
  data: { rows: unknown[]; columns: ResultColumn[] },
  options: Plot.AutoOptions,
) {
  return Plot.autoSpec(data.rows, options);
}

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
      (column) => column.type === "number" || column.type === "integer",
    );

    // if no number column, use first column
    if (!xColumn) {
      xColumn = columns[0];
    }
  }

  // find most likely y column
  const remainingColumns = columns.filter((col) => col.name !== xColumn?.name);

  let yColumn = remainingColumns.find(
    (column) => column.type === "number" || column.type === "integer",
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

export default function Chart(props: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [state, dispatch] = useReducer(chartReducer, initialChartState);

  useEffect(() => {
    if (!props.data) return;
    dispatch({
      type: "INITIALIZE",
      payload: { data: props.data, options: props.chartProps ?? {} },
    });
  }, [props]);

  useEffect(() => {
    if (!containerRef.current) return;

    const { data, x, y, scheme } = state;

    let plot: (HTMLElement | SVGSVGElement) & Plot.Plot;

    // #TODO: investigate and improve.
    try {
      const autoMark = Plot.auto(data, {
        x,
        y,
      });

      plot = Plot.plot({
        y: { grid: true },
        color: { scheme },
        marks: [autoMark],
      });

      containerRef.current.append(plot);
    } catch (e) {
      console.error("Error creating plot: ", e);
      toast.error("Error creating plot", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }

    return () => {
      if (plot) {
        plot.remove();
      }
    };
  }, [state]);

  return (
    <div className="order-1 flex size-full max-w-full flex-col xl:order-1 xl:flex-row">
      <div
        className={cn("size-full", props.containerClassName)}
        ref={containerRef}
      />

      {/* options */}
      <div>
        <PlotSettings />
      </div>
    </div>
  );
}
