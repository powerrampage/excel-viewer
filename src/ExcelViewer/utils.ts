import { CSSProperties } from "react";
import { Cell, Package } from "./types";
import { DependencyValue, SpreadsheetStore } from "./store";

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

export function groupCells(cells: Cell[]): Cell[][] {
  return cells.reduce((prev: Cell[][], cell) => {
    prev[cell.rowIndex] ||= [];
    prev[cell.rowIndex].push(cell);
    return prev;
  }, []);
}

export function spreadsheetMapper(data: Package[]) {
  const spreadsheet = data.reduce((prev, { listName, cells }) => {
    const cellMap = cells.reduce(
      (prev, { formula, value, rowIndex, columnIndex }) => {
        const cellKey = indexToReference(rowIndex, columnIndex);
        prev[cellKey] = { formula, value };
        return prev;
      },
      {} as SpreadsheetStore["cells"][string]
    );
    prev[listName] = cellMap;

    return prev;
  }, {} as SpreadsheetStore["cells"]);
  return spreadsheet;
}

export function indexToReference(rowIndex: number, colIndex: number): string {
  return String.fromCharCode(65 + colIndex) + (rowIndex + 1);
}

export function isFormula(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("=");
}

export function parseInt(value: string | null | undefined) {
  if (!isFinite(value as any) || typeof value !== "number") {
    return Number(value);
  }
  return value;
}

export function extractVariables(formula: string): string[] {
  const regex = /[A-Z]+\d+(:[A-Z]+\d+)?/g;
  const matches = formula.match(regex) || [];

  let expanded: string[] = [];

  matches.forEach((match) => {
    if (match.includes(":")) {
      const [start, end] = match.split(":");
      const [startCol, startRow] = [
        start.replace(/\d+/g, ""),
        Number(start.replace(/\D+/g, "")),
      ];
      const [_endCol, endRow] = [
        end.replace(/\d+/g, ""),
        Number(end.replace(/\D+/g, "")),
      ];

      for (let i = startRow; i <= endRow; i++) {
        expanded.push(`${startCol}${i}`);
      }
    } else {
      expanded.push(match);
    }
  });

  return expanded;
}

export function expandRange(range: string): string[] {
  const match = range.match(/^([A-Z]+)(\d+):([A-Z]+)(\d+)$/);
  if (!match) return [range];

  const [, startCol, startRow, endCol, endRow] = match;
  const startColCode = startCol.charCodeAt(0);
  const endColCode = endCol.charCodeAt(0);

  const dependencies: string[] = [];

  for (let col = startColCode; col <= endColCode; col++) {
    for (let row = Number(startRow); row <= Number(endRow); row++) {
      dependencies.push(String.fromCharCode(col) + row);
    }
  }

  return dependencies;
}

export function extractDependencies(formula: string, currentSheetKey: string): DependencyValue[] {
  const regex = /([A-Za-z0-9_]+!)?\$?([A-Z]+\d+(:[A-Z]+\d+)*)/g;
  const dependencies: DependencyValue[] = [];

  let match;
  while ((match = regex.exec(formula)) !== null) {
    const sheetKey = match[1] ? match[1].slice(0, -1) : currentSheetKey;
    const ref = match[2];

    if (ref.includes(":")) {
      // (e.g., "A1:A3" → ["A1", "A2", "A3"])
      const rangeRefs = expandRange(ref);
      dependencies.push(...rangeRefs.map((cellKey) => ({ sheetKey, cellKey })));
    } else {
      dependencies.push({ sheetKey, cellKey: ref });
    }
  }

  return dependencies;
}
