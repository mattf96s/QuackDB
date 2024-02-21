import { Suspense, useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";
import { toast } from "sonner";
import type { ResultColumn } from "@/utils/arrow/helpers";
import PlotSettings from "./components/settings";
import { ChartProvider } from "./context/provider";
import { useChart } from "./context/useChart";

type ChartProps = {
  data: {
    rows: unknown[];
    columns: ResultColumn[];
  };
  containerClassName?: React.HTMLProps<HTMLDivElement>["className"];
  chartProps?: Plot.AutoOptions;
};

export default function ChartContainer(props: ChartProps) {
  return (
    <ChartProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <Chart {...props} />
      </Suspense>
    </ChartProvider>
  );
}

/**
 * Still a work in progress...
 */
function Chart(props: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data, scheme, x, y, _dispatch } = useChart();

  useEffect(() => {
    _dispatch({
      type: "INITIALIZE",
      payload: { data: props.data, options: props.chartProps ?? {} },
    });
  }, [props, _dispatch]);

  useEffect(() => {
    let plot: (HTMLElement | SVGSVGElement) & Plot.Plot;

    if (!containerRef.current) return;

    if (!data || !x || !y) {
      return;
    }

    // #TODO: investigate and improve.
    try {
      const autoMark = Plot.auto(data, {
        x,
        y,
      });

      plot = Plot.plot({
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
  }, [x, y, scheme, data]);

  return (
    <div className="relative order-1 flex size-full max-w-full flex-col justify-between xl:order-1 xl:flex-row">
      <div ref={containerRef} />

      {/* options */}
      <div>
        <PlotSettings />
      </div>
    </div>
  );
}
