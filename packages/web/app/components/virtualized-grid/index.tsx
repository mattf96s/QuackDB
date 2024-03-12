/* eslint-disable jsx-a11y/click-events-have-key-events */
// https://virtuoso.dev/tanstack-table-integration/
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useMemo } from "react";
import { TableVirtuoso } from "react-virtuoso";
import { useQuery } from "~/context/query/useQuery";
import { getArrowTableSchema } from "~/utils/arrow/helpers";

/**
 * Virtualized Tanstack Table. (WIP).
 *
 * Will replace the current DataGrid component.
 *
 * @docs https://virtuoso.dev/tanstack-table-integration/
 */
export default function VirtualizedGrid() {
  const { table: arrowTable } = useQuery();

  const [sorting, setSorting] = React.useState<SortingState>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Record<string, unknown>, any>[] = useMemo(() => {
    // use schema to create columns
    if (!arrowTable) return [];
    const schema = getArrowTableSchema(arrowTable);
    return schema.map((s) => ({
      accessorKey: s.name,
      header: s.name,

      cell: (info) => {
        const v = info.getValue();
        if (v instanceof Date) {
          //return v.toLocaleString("en-ZA", { timeZone: "UTC" });
          return format(v, "PPpp");
        }
        if (typeof v === "object") {
          return JSON.stringify(v);
        }

        return <>{v}</>;
      },
    }));
  }, [arrowTable]);

  const data = useMemo(() => {
    if (!arrowTable) return [];
    return arrowTable.toArray().map((row) => row.toJSON());
  }, [arrowTable]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  return (
    <TableVirtuoso
      style={{ height: "600px" }}
      totalCount={rows.length}
      components={{
        Table: ({ style, ...props }) => {
          return (
            <table
              {...props}
              style={{
                ...style,
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                borderSpacing: 0,
              }}
            />
          );
        },
        TableRow: (props) => {
          const index = props["data-index"];
          const row = rows[index];

          return (
            <tr {...props}>
              {row?.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{ padding: "6px" }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          );
        },
      }}
      fixedHeaderContent={() => {
        return table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="m-0 bg-secondary"
          >
            {headerGroup.headers.map((header) => {
              return (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{
                    width: header.getSize(),
                    borderBottom: "1px solid lightgray",
                    padding: "2px 4px",
                  }}
                  className="text-left align-middle font-medium text-muted-foreground"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        style: header.column.getCanSort()
                          ? { cursor: "pointer", userSelect: "none" }
                          : {},
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                      className="inline-flex items-center gap-1 text-primary"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: (
                          <ChevronUp
                            size={16}
                            className="ml-1"
                          />
                        ),
                        desc: (
                          <ChevronDown
                            size={16}
                            className="ml-1"
                          />
                        ),
                        //   @ts-expect-error: TS doesn't know about the getIsSorted method
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        ));
      }}
    />
  );
}
