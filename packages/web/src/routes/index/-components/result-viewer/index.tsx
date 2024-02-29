import ErrorNotification from "@/components/error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaginationProvider } from "@/context/pagination/provider";
import { useQuery } from "@/context/query/useQuery";
import { useLocalStorage } from "@uidotdev/usehooks";
import { Suspense, lazy } from "react";
import DatasetActions from "./-components/dataset-actions";

const LazyJSONViewer = lazy(() =>
  import("./-components/json-viewer").then((module) => ({
    default: module.JSONViewer,
  })),
);

const LazyChartViewer = lazy(() =>
  import("./-components/chart").then((module) => ({
    default: module.ChartContainer,
  })),
);

const LazyTableViewer = lazy(() =>
  import("./-components/table").then((module) => ({
    default: module.TableViewer,
  })),
);

type ResultView = "table" | "chart" | "json";

/**
 * Parent container for the results viewer.
 */
export default function ResultsView() {
  const [tab, setTab] = useLocalStorage<ResultView>(
    `results-viewer-tab`,
    `table`,
  );

  const { meta } = useQuery();
  const error = meta?.error;

  return (
    <PaginationProvider>
      <div className="relative size-full max-w-full px-2">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as ResultView)}
          defaultValue="table"
          className="size-full space-y-6 px-4"
        >
          <div className="sticky inset-x-0 top-4 z-10 flex w-full justify-between px-2">
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
            <div className="inline-flex items-center gap-1">
              <DatasetActions />
            </div>
          </div>
          {error && (
            <div className="w-full px-4 py-10">
              <div className="mx-auto w-full">
                {error && (
                  <ErrorNotification error={error ?? "Unknown error"} />
                )}
              </div>
            </div>
          )}
          <TabsContent
            value="table"
            className="h-full flex-col border-none p-0 data-[state=active]:flex"
          >
            <Suspense fallback={<p>Loading...</p>}>
              <LazyTableViewer />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="chart"
            className="h-full flex-col border-none p-0 data-[state=active]:flex"
          >
            <Suspense fallback={<p>Loading...</p>}>
              <LazyChartViewer />
            </Suspense>
          </TabsContent>
          <TabsContent
            value="json"
            className="h-full flex-col border-none p-0 data-[state=active]:flex"
          >
            <Suspense fallback={<p>Loading...</p>}>
              <LazyJSONViewer />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </PaginationProvider>
  );
}
