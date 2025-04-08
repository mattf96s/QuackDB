import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePagination } from "@/context/pagination/usePagination";
import { type QueryResponse } from "@/types/query";
import { getArrowTableSchema } from "@/utils/arrow/helpers";
import { getColumnType } from "@/utils/duckdb/helpers/getColumnType";
import { format } from "date-fns";
import { useMemo } from "react";

export default function DataGrid(props: QueryResponse) {
  const { limit, offset } = usePagination();
  const { schema, rows } = useMemo(() => {
    if (!props.table || props.table.numRows === 0)
      return { schema: [], rows: [] };
    const rows = props.table
      .slice(offset, offset + limit)
      .toArray()
      .map((row) => row.toJSON());
    const schema = getArrowTableSchema(props.table);
    return { schema, rows };
  }, [props, limit, offset]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {schema.map((column) => {
            return <TableHead key={column.name}>{column.name}</TableHead>;
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {Object.entries(row).map(([column, value]) => {
              const type =
                schema.find((col) => col.name === column)?.type ?? "other";

              const coercedType = getColumnType(type);

              const Node = dynamicTypeViewer({
                type: coercedType,
                value,
              });

              return <TableCell key={column}>{Node}</TableCell>;
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type DynamicTypeViewerProps = {
  type:
    | "bigint"
    | "number"
    | "integer"
    | "boolean"
    | "date"
    | "string"
    | "other";
  value: unknown;
};

function dynamicTypeViewer(props: DynamicTypeViewerProps) {
  const { type, value } = props;

  switch (type) {
    case "date": {
      const date = format(new Date(value as string), "PPpp");
      return date;
    }
    case "string": {
      return value as string;
    }
    case "bigint": {
      return (value as bigint).toString();
    }
    case "boolean": {
      return `${value}` as string;
    }
    case "other": {
      return JSON.stringify(value);
    }
    case "integer":
    case "number": {
      if (isNaN(value as number)) return "";
      // round to 2 decimal places
      const formatter = new Intl.NumberFormat("en-UK", {
        maximumFractionDigits: 2,
      });
      return (
        <span className="text-right">{formatter.format(value as number)}</span>
      );
    }
    default:
      return "";
  }
}
