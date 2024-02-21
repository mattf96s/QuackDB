import { memo, Suspense, useEffect, useMemo, useState } from "react";
import { type AutoOptions } from "@observablehq/plot";
import { Await, defer } from "@tanstack/react-router";
import { AlertOctagon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getHighlighter } from "shiki";
import DataGrid from "@/components/data-grid";
import Chart from "@/components/plot";
import { useTheme } from "@/components/theme-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
          className="h-full flex-col border-none p-0 data-[state=active]:flex"
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

const limit = 100;

function JsonViewer() {
  const { rows } = useQuery();
  const { theme } = useTheme();
  const [offset, setOffset] = useState(0);

  const isDark = theme === "dark";

  const json = useMemo(
    () => JSON.stringify(rows.slice(offset, offset + limit), null, 2),
    [rows, offset],
  );

  return (
    <div className="flex h-full flex-1 flex-col justify-between gap-2 overflow-y-auto px-2 pb-4 xl:px-10">
      <ScrollArea className="h-72">
        <JsonContent
          json={json}
          isDark={isDark}
        />
      </ScrollArea>
      <div className="flex flex-col gap-2">
        <Separator />
        <div className="mx-auto mt-2 inline-flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOffset(offset - limit)}
            disabled={offset === 0}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setOffset(offset + limit)}
            disabled={offset + limit >= rows.length}
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

async function highlightJson(json: string, isDark: boolean) {
  return getHighlighter({
    themes: [isDark ? "vitesse-dark" : "vitesse-light"],
    langs: ["json"],
  })
    .then((highlighter) => {
      const html = highlighter.codeToHtml(json, {
        lang: "json",
        theme: isDark ? "vitesse-dark" : "vitesse-light",
      });

      /* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */
      return <div dangerouslySetInnerHTML={{ __html: html }} />;
    })
    .catch((error) => {
      console.error("Error in highlightJson: ", error);
      return <p className="text-red-500 dark:text-red-200">{error}</p>;
    });
}

function JsonContent({ isDark, json }: { isDark: boolean; json: string }) {
  const promise = defer(highlightJson(json, isDark));

  return (
    <Suspense fallback={<DeferFallback />}>
      <Await promise={promise}>{(p) => p}</Await>
    </Suspense>
  );
}

function DeferFallback() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    const id = setTimeout(() => {
      setMessage("Making it pretty...");
    }, 1000);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="inline-flex items-center gap-2">
      <p>{message}</p>
      <Loader2 className="size-5 animate-spin" />
    </div>
  );
}
