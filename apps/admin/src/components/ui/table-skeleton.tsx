import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

interface TableSkeletonRowsProps {
  columnsCount: number;
  rowCount?: number;
}

export function TableSkeletonRows({
  columnsCount,
  rowCount = 5,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rIdx) => (
        <TableRow key={rIdx} className="hover:bg-transparent">
          {Array.from({ length: columnsCount }).map((_, cIdx) => (
            <TableCell key={cIdx} className="py-4">
              <div
                className="h-4 bg-muted/60 dark:bg-muted/40 rounded animate-pulse"
                style={{
                  width: `${Math.floor(Math.random() * 40) + 50}%`,
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
