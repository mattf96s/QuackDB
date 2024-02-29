import { getHighlighter } from "@/components/code-highlighter";
import PaginationToolbar from "@/components/paginator";
import { useTheme } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePagination } from "@/context/pagination/usePagination";
import { useQuery } from "@/context/query/useQuery";
import { Await, defer } from "@tanstack/react-router";
import { Suspense, memo, useEffect, useMemo } from "react";

export const JSONViewer = memo(function JSONViewer() {
  const { rows, count } = useQuery();
  const { theme } = useTheme();
  const { limit, offset, onSetCount } = usePagination();

  // Update the count when we receive data (don't like this pattern...)
  useEffect(() => {
    onSetCount(count);
  }, [onSetCount, count]);

  const isDark = theme === "dark";

  const json = useMemo(
    () => JSON.stringify(rows.slice(offset, offset + limit), null, 2),
    [rows, offset, limit],
  );

  return (
    <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4 pb-20">
      <ScrollArea className="h-full border">
        <JsonContent
          json={json}
          isDark={isDark}
        />
      </ScrollArea>
      <div className="flex w-full justify-end">
        <PaginationToolbar />
      </div>
    </div>
  );
});

async function highlightJson(json: string, isDark: boolean) {
  const shiki = await getHighlighter();

  const html = shiki.codeToHtml(json, {
    lang: "json",
    theme: isDark ? "vitesse-dark" : "github-light",
  });

  return (
    <div
      className="overflow-x-auto font-mono text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function JsonContent({ isDark, json }: { isDark: boolean; json: string }) {
  const promise = defer(highlightJson(json, isDark));

  return (
    <Suspense>
      <Await promise={promise}>{(p) => p}</Await>
    </Suspense>
  );
}
