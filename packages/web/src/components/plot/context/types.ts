import type * as Plot from "@observablehq/plot";
import type { ResultColumn } from "@/utils/arrow/helpers";

export type ChartState = Pick<
  Plot.AutoOptions,
  "x" | "y" | "color" | "mark"
> & {
  data: Plot.Data;
  columns: ResultColumn[];
  scheme: Plot.ScaleOptions["scheme"];
  _dispatch: React.Dispatch<ChartAction>;
};

export type ChartAction =
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
