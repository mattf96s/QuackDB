import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
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
import type { FetchResultsReturn } from "@/constants";
import { getColumnType } from "@/utils/duckdb/helpers/getColumnType";

export default function DataGrid(props: FetchResultsReturn) {
  const { rows, schema } = props;
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const count = rows.length;

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
      <ScrollArea className="size-full max-h-[800px] max-w-[1000px]">
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
      </ScrollArea>

      <Separator />

      <PaginationToolbar
        total={count}
        onNextPage={onNextPage}
        onPrevPage={onPrevPage}
        canGoNext={offset + limit < count}
        canGoPrev={offset > 0}
        limit={limit}
        onLimitChange={(value) => {
          setOffset(0); // reset offset when limit changes
          setLimit(value);
        }}
        goToFirstPage={() => {
          setOffset(0);
        }}
        goToLastPage={() => {
          setOffset(count - limit);
        }}
        goToPage={(page) => {
          setOffset(page * limit);
        }}
      />
    </>
  );
}

type PaginationToolbarProps = {
  onNextPage: () => void;
  onPrevPage: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  limit: number;
  onLimitChange: (value: number) => void;
  goToPage: (page: number) => void;
  goToLastPage: () => void;
  goToFirstPage: () => void;
  total: number;
};

function PaginationToolbar(props: PaginationToolbarProps) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    // Don't like this pattern but temporary solution.
    const toolbarEl = document.getElementById("results-viewer-toolbar");

    if (toolbarEl) {
      setEl(toolbarEl);
    }

    return () => {
      setEl(null);
    };
  }, []);

  const {
    onNextPage,
    onPrevPage,
    canGoNext,
    canGoPrev,
    limit,
    onLimitChange,
    goToFirstPage,
    goToLastPage,
    total,
  } = props;

  if (!el) return null;

  return createPortal(
    <div className="flex flex-row items-center gap-4">
      <div className="inline-flex items-center gap-1">
        <Button
          size="icon"
          variant="secondary"
          onClick={goToFirstPage}
          disabled={!canGoPrev}
        >
          <ChevronsLeftIcon className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={onPrevPage}
          disabled={!canGoPrev}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={onNextPage}
          disabled={!canGoNext}
        >
          <ChevronRightIcon className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={goToLastPage}
          disabled={!canGoNext}
        >
          <ChevronsRightIcon className="size-4" />
        </Button>
      </div>
      <PageSize
        total={total}
        value={`${limit}`}
        onChange={(newValue) => {
          onLimitChange(parseInt(newValue));
        }}
      />
    </div>,
    el,
  );
}

type PageSizeProps = {
  value: string;
  onChange: (value: string) => void;
  total: number;
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
        <SelectSeparator />
        <SelectGroup>
          <SelectItem value={`${props.total ?? 0}`}>All</SelectItem>
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
