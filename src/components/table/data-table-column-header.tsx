import { ArrowUp, ArrowDown } from "lucide-react";
import { Column } from "@tanstack/react-table";
import React from "react";

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  onSort?: (id: string, desc: boolean) => void;
  isSorted?: boolean;
  isDesc?: boolean;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  onSort,
  isSorted,
  isDesc,
}: DataTableColumnHeaderProps<TData, TValue>) {
  return (
    <div className="flex items-center cursor-pointer select-none" onClick={() => {
      if (onSort) onSort(column.id, isSorted ? !isDesc : false);
    }}>
      <span>{title}</span>
      {isSorted && (
        isDesc ? <ArrowDown className="ml-1 w-3 h-3" /> : <ArrowUp className="ml-1 w-3 h-3" />
      )}
    </div>
  );
}
