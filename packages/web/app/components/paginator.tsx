import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { usePagination } from "~/context/pagination/usePagination";

/**
 * Pagination toolbar.
 *
 * To be used with the `PaginationProvider`.
 */
export default function PaginationToolbar() {
  const {
    canGoNext,
    canGoPrev,
    count,
    goToFirstPage,
    goToLastPage,
    limit,
    offset,
    onNextPage,
    onPrevPage,
  } = usePagination();
  const totalPages = limit > 0 ? Math.ceil(count / limit) : 0;
  const currentPage = limit > 0 ? Math.ceil(offset / limit) : 0;
  const pageNumber = totalPages > 0 ? currentPage + 1 : 0;

  return (
    <div className="flex flex-row items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-secondary-foreground">
          {`Page ${pageNumber} of ${totalPages}`}
        </span>
      </div>
      <PageSize />
      <div className="inline-flex items-center gap-1">
        <Button
          size="icon"
          variant="secondary"
          onClick={goToFirstPage}
          disabled={!canGoPrev}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={onPrevPage}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={onNextPage}
          disabled={!canGoNext}
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={goToLastPage}
          disabled={!canGoNext}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function PageSize() {
  const { limit, onLimitChange, count } = usePagination();

  const onValueChange = (value: string) => {
    const size = Number(value);
    if (isNaN(size) || size < 0) return;
    onLimitChange(size);
  };

  return (
    <Select
      value={`${limit}`}
      onValueChange={onValueChange}
    >
      <SelectTrigger className="h-8 w-20">
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
          <SelectItem value={`${count ?? 100}`}>All</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
