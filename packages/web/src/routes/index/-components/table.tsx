import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getColumnType } from "@/utils/duckdb/helpers/getColumnType";

type TablePreviewProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: any[];
  columns: Map<string, string>;
};

export default function TableView(props: TablePreviewProps) {
  const { results, columns } = props;
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const [limit, setLimit] = useState(10);
  // const [columns, setColumns] = useState<Map<string, string>>(new Map());
  //const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columnsArray = Array.from(columns.entries());

  const onPrevPage = () => {
    let newOffset = offset - limit;
    if (newOffset < 0) {
      newOffset = 0;
    }
    setOffset(newOffset);
  };

  const onNextPage = () => {
    let newOffset = offset + limit;
    if (newOffset > count) {
      newOffset = count;
    }
    setOffset(newOffset);
  };

  return (
    <>
      <ScrollArea className="h-full max-h-[800px] w-full min-w-[1000px]">
        <Table>
          <TableHeader>
            <TableRow>
              {columnsArray.map(([title]) => {
                return <TableHead key={title}>{title}</TableHead>;
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {results.map((row, i) => (
              <TableRow key={i}>
                {Object.entries(row).map(([column, value]) => {
                  const type = columns.get(column) as string;

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
      </ScrollArea>

      <Separator />

      <div className="mx-auto mt-8 flex w-full justify-center">
        <div className="flex flex-row items-center gap-1">
          <Button
            variant="ghost"
            onClick={onPrevPage}
            disabled={offset === 0}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <Button
            variant="ghost"
            onClick={onNextPage}
            disabled={offset + limit >= count}
          >
            <span>Next</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <PageSize
            value={`${limit}`}
            onChange={(newValue) => {
              setLimit(parseInt(newValue));
            }}
          />
        </div>
      </div>

      {isLoading && (
        <span className="absolute right-0 top-0 z-50">
          <Loader2 className="h-5 w-5 animate-spin" />
        </span>
      )}
    </>
  );
}

type PageSizeProps = {
  value: string;
  onChange: (value: string) => void;
};

function PageSize(props: PageSizeProps) {
  const { value, onChange } = props;
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-20">
        <SelectValue placeholder="Page size" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Size</SelectLabel>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="15">15</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
          <SelectItem value="100">100</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
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
