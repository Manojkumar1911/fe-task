import { type Table } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const [pageInput, setPageInput] = useState<string>("");
  const [isFirstPopoverOpen, setFirstPopoverOpen] = useState(false);
  const [isSecondPopoverOpen, setSecondPopoverOpen] = useState(false);
  const [secondPageInput, setSecondPageInput] = useState<string>("");

  const handleSetPage = () => {
    const pageIndex = Number(pageInput) - 1;
    if (pageIndex >= 0 && pageIndex < table.getPageCount()) {
      table.setPageIndex(pageIndex);
    }
    setPageInput("");
    setFirstPopoverOpen(false);
  };

  const handleSecondSetPage = () => {
    const pageIndex = Number(secondPageInput) - 1;
    if (pageIndex >= 0 && pageIndex < table.getPageCount()) {
      table.setPageIndex(pageIndex);
    }
    setSecondPageInput("");
    setSecondPopoverOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
  value={`${table.getState().pagination.pageSize}`}
  onValueChange={(value) => {
    table.setPageSize(Number(value));
    table.setPageIndex(0); // ✅ Reset to first page
  }}
>

          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                className={
                  !table.getCanPreviousPage()
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            {/* First page */}
            {table.getPageCount() > 0 && (
              <PaginationItem>
                <PaginationLink
                  isActive={table.getState().pagination.pageIndex === 0}
                  onClick={() => table.setPageIndex(0)}
                  className={
                    table.getState().pagination.pageIndex === 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : ""
                  }
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* First ellipsis */}
            {table.getState().pagination.pageIndex > 2 && (
              <PaginationItem>
                <Popover
                  open={isFirstPopoverOpen}
                  onOpenChange={setFirstPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-9 cursor-pointer p-0"
                    >
                      <PaginationEllipsis />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 p-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Page"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        className="h-8"
                      />
                      <Button size="sm" className="h-8" onClick={handleSetPage}>
                        Go
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </PaginationItem>
            )}

            {/* Current page and surrounding pages */}
            {table.getPageCount() > 1 &&
              Array.from({ length: Math.min(3, table.getPageCount() - 2) }).map(
                (_, i) => {
                  const currentPageIndex = table.getState().pagination.pageIndex;
                  let page;

                  if (currentPageIndex <= 2) {
                    page = i + 1;
                  } else if (currentPageIndex >= table.getPageCount() - 3) {
                    page = table.getPageCount() - 3 + i;
                  } else {
                    page = currentPageIndex - 1 + i;
                  }

                  // Skip if this would duplicate first or last page
                  if (page === 0 || page === table.getPageCount() - 1)
                    return null;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPageIndex === page}
                        onClick={() => table.setPageIndex(page)}
                        className={
                          currentPageIndex === page
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        }
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                },
              )}

            {/* Second ellipsis */}
            {table.getState().pagination.pageIndex <
              table.getPageCount() - 3 && (
              <PaginationItem>
                <Popover
                  open={isSecondPopoverOpen}
                  onOpenChange={setSecondPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 w-9 cursor-pointer p-0"
                    >
                      <PaginationEllipsis />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-44 p-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Page"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSecondSetPage();
                          }
                        }}
                        value={secondPageInput}
                        onChange={(e) => setSecondPageInput(e.target.value)}
                        className="h-8"
                      />
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={handleSecondSetPage}
                      >
                        Go
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </PaginationItem>
            )}

            {/* Last page */}
            {table.getPageCount() > 1 && (
              <PaginationItem>
                <PaginationLink
                  isActive={
                    table.getState().pagination.pageIndex ===
                    table.getPageCount() - 1
                  }
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  className={
                    table.getState().pagination.pageIndex ===
                    table.getPageCount() - 1
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : ""
                  }
                >
                  {table.getPageCount()}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                className={
                  !table.getCanNextPage()
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}