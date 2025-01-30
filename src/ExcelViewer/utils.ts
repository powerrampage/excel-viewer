import { CSSProperties } from "react";
import { Cell } from "./types";

export function getCellStyles(cell: Cell): CSSProperties {
  return {
    whiteSpace: "nowrap",

    width: cell.width || "auto",
    height: cell.height || "auto",
    fontSize: cell.fontSize || 14,
    fontWeight: cell.bold ? "bold" : "normal",
    fontStyle: cell.italic ? "italic" : "normal",
    fontFamily: cell.fontName || "Arial, sans-serif",
    color: cell.textColor || "#000",
    backgroundColor: cell.backgroundColor || "transparent",
    border:
      cell.border === "allSides"
        ? `1px solid #000`
        : cell.border === "noBorder"
        ? "none"
        : "",
  };
}

export function fillMissingCells(cells: Cell[]): Cell[][] {
  const maxRowIndex = Math.max(...cells.map((cell) => cell.rowIndex));
  const maxColIndex = Math.max(...cells.map((cell) => cell.columnIndex));

  const cellMap = new Map(
    cells.map((cell) => [`${cell.rowIndex}-${cell.columnIndex}`, cell])
  );

  const filledCells: Record<number, Partial<Cell>[]> = {};

  for (let row = 0; row <= maxRowIndex; row++) {
    for (let col = 0; col <= maxColIndex; col++) {
      const key = `${row}-${col}`;
      filledCells[row] ||= [];

      if (cellMap.has(key)) {
        const cell = cellMap.get(key)!;
        filledCells[row].push(cell);
      } else {
        filledCells[row].push({ rowIndex: row, columnIndex: col, value: "" });
      }
    }
  }

  return Object.values(filledCells) as Cell[][];
}

export function indexToReference(rowIndex: number, colIndex: number): string {
  return String.fromCharCode(65 + colIndex) + (rowIndex + 1);
}

export function isFormula(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("=");
}
