import DataGrid from "@/components/data-grid";
import PaginationToolbar from "@/components/paginator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@/context/query/useQuery";
import { memo } from "react";
import EmptyResults from "./empty";

export const TableViewer = memo(function TableViewer() {
  const { rows, schema, meta, count } = useQuery();

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
