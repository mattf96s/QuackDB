import DataGrid from "@/components/data-grid";
import PaginationToolbar from "@/components/paginator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePagination } from "@/context/pagination/usePagination";
import { useQuery } from "@/context/query/useQuery";
import { memo, useEffect } from "react";
import EmptyResults from "./empty";

export const TableViewer = memo(function TableViewer() {
  const { rows, schema, meta, count } = useQuery();

  const { onSetCount } = usePagination();

  // Update the count when we receive data (don't like this pattern...)
  useEffect(() => {
    onSetCount(count);
  }, [onSetCount, count]);

  const noQuery = rows.length === 0 && schema.length === 0;

  return (
    <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4 pb-20">
      {noQuery && <EmptyResults />}
      <ScrollArea className="h-full border">
        <DataGrid
          count={count}
          rows={rows}
          schema={schema}
          meta={meta}
        />
      </ScrollArea>
      <div className="flex w-full justify-end">
        <PaginationToolbar />
      </div>
    </div>
  );
});
