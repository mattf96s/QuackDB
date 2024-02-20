import { memo, useState } from "react";
import { type AutoOptions } from "@observablehq/plot";
import { AlertOctagon } from "lucide-react";
import DataGrid from "@/components/data-grid";
import Chart from "@/components/plot";
import { useTheme } from "@/components/theme-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@/context/query/useQuery";
import { cn } from "@/lib/utils";

export default function ResultsView() {
  const { error } = useQuery();
  return (
    <div className="size-full p-4">
      <Tabs
        defaultValue="table"
        className="size-full space-y-6"
      >
        <div className="flex items-center justify-between">
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
        {error && (
          <div className="w-full px-4 py-10">
            <div className="mx-auto max-w-fit">
              {error && <ErrorNotification error={error ?? "Unknown error"} />}
            </div>
          </div>
        )}
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
          <JsonViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ErrorNotification(props: { error: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Alert
      variant={isDark ? "default" : "destructive"}
      className={cn(
        "group flex flex-col gap-3 hover:shadow hover:dark:border-card-foreground/30",
        "space-y-1 font-mono dark:bg-accent dark:text-accent-foreground",
      )}
    >
      <AlertTitle>
        <span className="inline-flex items-center gap-2">
          <AlertOctagon className="size-4" />
          <p className="text-base">Error</p>
        </span>
      </AlertTitle>
      <AlertDescription className="whitespace-pre-wrap font-mono text-sm">
        {props.error}
      </AlertDescription>
    </Alert>
  );
}

const TableViewer = memo(function TableViewer() {
  const { rows, schema } = useQuery();

  const noQuery = rows.length === 0 && schema.length === 0;

  return (
    <div className="size-full max-h-full max-w-full overflow-auto">
      {noQuery && <EmptyResults />}
      <DataGrid
        rows={rows}
        schema={schema}
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
    <div className="relative flex size-full flex-row gap-2 overflow-y-auto p-2">
      <div className="w-full">
        <Chart
          data={{ rows, columns: schema }}
          containerClassName="px-10 py-4"
          chartProps={options}
        />
      </div>
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

function JsonViewer() {
  const { rows } = useQuery();

  return (
    <div className="size-full max-h-full overflow-auto">
      <pre className="whitespace-pre-wrap text-sm text-foreground">
        {JSON.stringify(rows, null, 2)}
      </pre>
    </div>
  );
}
