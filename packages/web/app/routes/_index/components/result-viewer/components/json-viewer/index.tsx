import { Suspense, lazy, memo, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "remix-themes";
import CopyToClipboard from "~/components/copy-to-clipboard";
import PaginationToolbar from "~/components/paginator";
import { ScrollArea } from "~/components/ui/scroll-area";
import { usePagination } from "~/context/pagination/usePagination";
import { useQuery } from "~/context/query/useQuery";

const LazyShiki = lazy(() =>
  import("./lazy-shiki").then((module) => ({
    default: module.default,
  })),
);

export const JSONViewer = memo(function JSONViewer() {
  const { rows, count } = useQuery();
  const [theme] = useTheme();
  const { limit, offset, onSetCount } = usePagination();

  // Update the count when we receive data (don't like this pattern...)
  // Effectively initializes the pagination state.
  useEffect(() => {
    onSetCount(count);
  }, [onSetCount, count]);

  const isDark = theme === "dark";

  const json = useMemo(
    () => JSON.stringify(rows.slice(offset, offset + limit), null, 2),
    [rows, offset, limit],
  );

  const lazyCopy = useCallback(() => JSON.stringify(rows, null, 2), [rows]);

  return (
    <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4 pb-20">
      <ScrollArea className="relative h-full border">
        <Suspense>
          <LazyShiki
            json={json}
            isDark={isDark}
          />
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
