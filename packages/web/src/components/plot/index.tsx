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
    const controller = new AbortController();
    const { signal } = controller;

    if (containerRef.current === null) return;

    const { rows, columns } = props.data;
    if (rows.length === 0) return;
    if (columns.length === 0) return; // must have one column at least

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

    const plot = Plot.auto(rows, {
      ...(xColumn ? { x: xColumn?.name } : {}),
      ...(yColumn ? { y: yColumn?.name } : {}),
      ...props.chartProps,
    }).plot();

    signal.addEventListener("abort", () => {
      plot.remove();
    });

    containerRef.current.append(plot);
    return () => {
      controller.abort();
      plot.remove();
    };
  }, [props.chartProps, props.data]);

  return (
    <div
      className={cn("h-full w-full", props.containerClassName)}
      ref={containerRef}
    />
  );
}
