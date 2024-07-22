import {
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue,
  Table,
} from "@nextui-org/react";
import React, { useState } from "react";

interface TableComponentProps {
  columns: any;
  rows: any;
  size?: "default" | "compact";
  onRowClick?: (key: string) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  columns,
  rows,
  onRowClick,
  size = "default",
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: string;
  } | null>(null);

  const parseValue = (value: string) => {
    if (value === undefined || value === "") return 0;
    value = String(value);
    // Remove any non-numeric characters except for '.' and '-'
    const numericValue = value.replace(/[^\d.-]/g, "");
    return parseFloat(numericValue);
  };

  const sortedRows = React.useMemo(() => {
    let sortableRows = [...rows];
    if (sortConfig !== null) {
      sortableRows.sort((a, b) => {
        const aValue = parseValue(getKeyValue(a, sortConfig.key));
        const bValue = parseValue(getKeyValue(b, sortConfig.key));

        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRows;
  }, [rows, sortConfig]);

  const requestSort = (key: string) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="h-full overflow-scroll">
      <Table
        aria-label="Table"
        removeWrapper
        shadow="none"
        classNames={{
          th: " table-header ",
          tbody: "px-2 h-full ",
          tr: `${onRowClick ? "cursor-pointer hover:text-[#a1a1aa]" : ""} ${
            size === "compact" ? "h-[35px]" : "h-[50px]"
          } table-row `,
          td: "px-0 pl-2",
        }}
      >
        <TableHeader columns={columns}>
          {(column: any) => (
            <TableColumn
              key={column.key}
              onClick={() => requestSort(column.key)}
              style={{ cursor: "pointer" }}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={sortedRows}>
          {(item: any) => (
            <TableRow
              key={item.key}
              onClick={onRowClick ? () => onRowClick(item.key) : () => {}}
            >
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
export default TableComponent;
