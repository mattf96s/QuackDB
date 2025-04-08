import { cn } from "@/lib/utils";
import * as Plot from "@observablehq/plot";
import { memo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useChart } from "./context/useChart";

type ChartProps = {
  containerClassName?: React.HTMLProps<HTMLDivElement>["className"];
};

/**
 * Still a work in progress...
 */
const Chart = memo(function Chart(props: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { data, scheme, x, y, color, mark } = useChart();

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
        color,
        mark,
      });

      plot = Plot.plot({
        color: { scheme },
        marks: [autoMark],
        marginBottom: 40,
        marginLeft: 100,
        marginRight: 40,
        marginTop: 80,
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
  }, [x, y, scheme, data, color, mark]);

  return (
    <div
      className={cn(
        "relative order-1 flex size-full max-w-full flex-col justify-between xl:order-1 xl:flex-row",
        props.containerClassName
      )}
    >
      <div ref={containerRef} />
    </div>
  );
});

export default Chart;
