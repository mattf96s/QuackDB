import { memo, useState } from "react";
import { type AutoOptions } from "@observablehq/plot";
import DataGrid from "@/components/data-grid";
import Chart from "@/components/plot";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@/context/query/useQuery";

export default function ResultsView() {
  const { rows, schema } = useQuery();

  return (
    <div className="h-full w-full px-4 py-4">
      <Tabs
        defaultValue="table"
        className="h-full w-full space-y-6"
      >
        <div className="space-between flex items-center">
          <TabsList>
            {["Table", "Chart", "Json"].map((value) => (
              <TabsTrigger
                key={value}
                value={value.toLowerCase()}
                className="text-xs"
              >
                {value}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent
          value="table"
          className="h-full max-w-full border-none p-0 pb-20 outline-none"
        >
          <TableViewer />
        </TabsContent>
        <TabsContent
          value="chart"
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
        >
          <ChartViewer />
        </TabsContent>
        <TabsContent
          value="json"
          className="h-full pb-10"
        >
          <div className="h-full max-h-full overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-900">
              {JSON.stringify(rows, null, 2)}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const TableViewer = memo(function TableViewer() {
  const { rows, schema } = useQuery();

  const noQuery = rows.length === 0 && schema.length === 0;

  return (
    <div className="h-full max-h-full w-full max-w-full overflow-x-auto overflow-y-auto">
      {noQuery && <EmptyResults />}
      <DataGrid
        rows={rows}
        schema={schema}
      />
    </div>
  );
});

const ChartViewer = memo(function ChartViewer() {
  const { rows, schema } = useQuery();

  const [options, setOptions] = useState<AutoOptions>({});

  return (
    <div className="relative flex h-full w-full flex-row gap-2 overflow-y-auto p-2">
      <div>
        <Chart
          data={{ rows, columns: schema }}
          containerClassName="px-10 py-4"
          chartProps={options}
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Config</h3>
        <Separator />
        <Textarea
          disabled
          value={JSON.stringify(options, null, 2)}
          onChange={(e) => setOptions(JSON.parse(e.target.value))}
        />
      </div>
    </div>
  );
});

function EmptyResults() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-gray-400">No query results</p>
    </div>
  );
}
