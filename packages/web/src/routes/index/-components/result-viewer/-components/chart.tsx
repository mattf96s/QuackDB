import Chart from "@/components/plot";
import { useQuery } from "@/context/query/useQuery";
import { type AutoOptions } from "@observablehq/plot";
import { memo, useState } from "react";
import EmptyResults from "./empty";

/**
 * WIP
 */
export const ChartViewer = memo(function ChartViewer() {
  const { rows, schema } = useQuery();

  const [options, _setOptions] = useState<AutoOptions>({});

  if (!rows.length || !schema.length) {
    return <EmptyResults />;
  }

  return (
    <div className="flex h-full max-w-full flex-col justify-between gap-2 overflow-y-auto px-2 pb-4 xl:px-10">
      <Chart
        data={{ rows, columns: schema }}
        chartProps={options}
      />
    </div>
  );
});
