import { useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ResultColumn } from "@/utils/arrow/helpers";

type ChartProps = {
  data: {
    rows: unknown[];
    columns: ResultColumn[];
  };
  containerClassName?: React.HTMLProps<HTMLDivElement>["className"];
  chartProps?: Plot.AutoOptions;
};

export default function Chart(props: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (containerRef.current === null) return;

    if (!props.data) return;

    const { rows, columns } = props.data;

    if (rows.length === 0 && columns.length === 0) return;

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
    const remainingColumns = columns.filter(
      (col) => col.name !== xColumn?.name,
    );

    let yColumn = remainingColumns.find(
      (column) => column.type === "number" || column.type === "integer",
    );
    if (!yColumn && remainingColumns.length > 0) {
      // use first column
      yColumn = remainingColumns[0];
    }

    if (!xColumn && !yColumn) {
      console.error("No suitable columns found for x and y axis: ");
      toast.error("No suitable columns found for x and y axis", {
        description: "Please check the schema",
      });
    }

    let plot: ((SVGSVGElement | HTMLElement) & Plot.Plot) | undefined;

    // #TODO: investigate and improve.
    try {
      plot = Plot.auto(rows, {
        ...(xColumn ? { x: xColumn?.name } : {}),
        ...(yColumn ? { y: yColumn?.name } : {}),
        ...props.chartProps,
      }).plot();

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
  }, [props]);

  return (
    <div
      className={cn("size-full", props.containerClassName)}
      ref={containerRef}
    />
  );
}
