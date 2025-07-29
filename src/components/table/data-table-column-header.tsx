import { ArrowUp, ArrowDown } from "lucide-react";
import { Column } from "@tanstack/react-table";
import React from "react";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className="text-left font-medium">{title}</div>;
  }

  return (
    <div 
      className="flex items-center cursor-pointer select-none hover:text-primary transition-colors"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span className="font-medium">{title}</span>
      {column.getIsSorted() === "asc" && (
        <ArrowUp className="ml-1 w-4 h-4 text-primary" />
      )}
      {column.getIsSorted() === "desc" && (
        <ArrowDown className="ml-1 w-4 h-4 text-primary" />
      )}
      {!column.getIsSorted() && (
        <div className="ml-1 w-4 h-4 opacity-30">
          <ArrowUp className="w-3 h-3" />
          <ArrowDown className="w-3 h-3 -mt-1" />
        </div>
      )}
    </div>
  );
}
