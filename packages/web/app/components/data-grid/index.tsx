import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { FetchResultsReturn } from "~/constants";
import { usePagination } from "~/context/pagination/usePagination";
import { getColumnType } from "~/utils/duckdb/helpers/getColumnType";

export default function DataGrid(props: FetchResultsReturn) {
  const { rows, schema } = props;

  const { limit, offset } = usePagination();

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
        {rows.slice(offset, offset + limit).map((row, i) => (
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
