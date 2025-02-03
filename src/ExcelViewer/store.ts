import { createWithEqualityFn as create } from "zustand/traditional";
import { evaluateFormula } from "./formula-utils";
import { Cell } from "./types";
import { extractDependencies, isFormula } from "./utils";
import _ from "lodash";

export type SheetKey = string;
export type CellKey = string;
export type CellValue = Pick<Cell, "value" | "formula">;
export type DependencyValue = { sheetKey: SheetKey; cellKey: CellKey };

export interface SpreadsheetStoreState {
  currentSheetKey: SheetKey | null;
  cells: Record<SheetKey, Record<CellKey, CellValue>>;
  dependencies: Record<SheetKey, Record<CellKey, DependencyValue[]>>;
}

export interface SpreadsheetStoreActions {
  setCellValue: (
    sheetKey: SheetKey,
    cellKey: CellKey,
    cellValue: CellValue
  ) => void;
  setCellFormula: (
    sheetKey: SheetKey,
    cellKey: CellKey,
    cellValue: CellValue
  ) => void;
  setCurrentSheetKey: (sheetKey: SheetKey) => void;
  setSpreadsheet: (spreadsheet: SpreadsheetStoreState["cells"]) => void;
  setDependencies: (spreadsheet: SpreadsheetStoreState["cells"]) => void;
}

export type SpreadsheetStore = SpreadsheetStoreState & SpreadsheetStoreActions;

export const useSpreadsheetStore = create<SpreadsheetStore>()((set, get) => ({
  currentSheetKey: null,
  cells: {},
  dependencies: {},

  setCurrentSheetKey(sheetKey) {
    set(() => {
      return { currentSheetKey: sheetKey };
    });
  },
  setCellValue(sheetKey, cellKey, cellValue) {
    set((state) => {
      const newCells = _.cloneDeep(state.cells);
      _.set(newCells, [sheetKey, cellKey], cellValue);

      const dependencies = _.get(state.dependencies, [sheetKey, cellKey], []);

      if (dependencies.length) {
        dependencies.forEach(({ sheetKey, cellKey }) => {
          const cell = _.get(newCells, [sheetKey, cellKey]);
          if (cell) {
            _.set(
              newCells,
              [sheetKey, cellKey, "value"],
              evaluateFormula(cell.formula!, sheetKey, newCells)
            );
          }
        });
      }

      return { cells: newCells };
    });
  },
  setCellFormula(sheetKey, cellKey, cellValue) {
    set((state) => {
      const cells = state.cells;

      cells[sheetKey][cellKey] = {
        value: evaluateFormula(cellValue.formula!, sheetKey, state.cells),
        formula: cellValue.formula,
      };

      get().setDependencies(cells);

      return { cells };
    });
  },
  setSpreadsheet(cells) {
    set(() => {
      return { cells };
    });
  },
  setDependencies(spreadsheet) {
    set(() => {
      const dependencies: SpreadsheetStore["dependencies"] = {};
      const currentSheetKey = get().currentSheetKey!;

      Object.entries(spreadsheet).forEach(([sheetKey, cells]) => {
        Object.entries(cells).forEach(([cellKey, cellValue]) => {
          if (!isFormula(cellValue.formula)) return;

          extractDependencies(cellValue.formula!, currentSheetKey).forEach(
            (dependency) => {
              _.update(
                dependencies,
                `${dependency.sheetKey}.${dependency.cellKey}`,
                (refs = []) => [...refs, { sheetKey, cellKey }]
              );
            }
          );
        });
      });

      return { dependencies };
    });
  },
}));
