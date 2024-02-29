import DataGrid from "@/components/data-grid";
import Chart from "@/components/plot";
import { useQuery } from "@/context/query/useQuery";
import { type AutoOptions } from "@observablehq/plot";
import { memo, useState } from "react";

const TableViewer = memo(function TableViewer() {
  const { rows, schema, meta, count } = useQuery();

  const noQuery = rows.length === 0 && schema.length === 0;

  return (
    <div className="flex h-full flex-1 flex-col justify-between gap-2 overflow-y-auto px-2 pb-4 xl:px-10">
      {noQuery && <EmptyResults />}
      <DataGrid
        count={count}
        rows={rows}
        schema={schema}
        meta={meta}
      />
    </div>
  );
});

/**
 * WIP
 */
const ChartViewer = memo(function ChartViewer() {
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

function EmptyResults() {
  return (
    <div className="flex size-full items-center justify-center">
      <p className="text-gray-400">No query results</p>
    </div>
  );
}
