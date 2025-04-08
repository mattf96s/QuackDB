import CopyToClipboard from "@/components/copy-to-clipboard";
import PaginationToolbar from "@/components/paginator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePagination } from "@/context/pagination/usePagination";
import { useQuery } from "@/context/query/useQuery";
import { Suspense, lazy, memo, useCallback, useEffect, useMemo } from "react";

const LazyShiki = lazy(() =>
  import("@/components/lazy-shiki").then((module) => ({
    default: module.default,
  }))
);

export const JSONViewer = memo(function JSONViewer() {
  const { table, count } = useQuery();
  const { limit, offset, onSetCount } = usePagination();

  // Update the count when we receive data (don't like this pattern...)
  // Effectively initializes the pagination state.
  useEffect(() => {
    onSetCount(count);
  }, [onSetCount, count]);

  const json = useMemo(() => {
    if (!table || table.numRows === 0) return "[]";
    const rows = table
      .slice(offset, offset + limit)
      .toArray()
      .map((row) => row.toJSON());
    return JSON.stringify(rows, null, 2);
  }, [table, offset, limit]);

  const lazyCopy = useCallback(() => {
    if (!table || table.numRows === 0) return "[]";
    const rows = table.toArray().map((row) => row.toJSON());
    return JSON.stringify(rows, null, 2);
  }, [table]);

  return (
    <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4 pb-20">
      <ScrollArea className="relative h-full border">
        <Suspense>
          <LazyShiki text={json} lang="json" />
          <div className="absolute right-2 top-2">
            <CopyToClipboard value={lazyCopy} />
          </div>
        </Suspense>
      </ScrollArea>
      <div className="flex w-full justify-end">
        <PaginationToolbar />
      </div>
    </div>
  );
});
