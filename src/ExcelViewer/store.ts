import _ from "lodash";
import { createWithEqualityFn as create } from "zustand/traditional";
import { Cell } from "./types";
import { hfService } from "./lib/hyperformula";
import { extractDependencies, isFormula } from "./utils";

export type SheetKey = string;
export type CellKey = string; // "4-5" (row: 4, col: 5)
export type CellCoord = { row: number; col: number };
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
  setCurrentSheetKey: (sheetKey: SheetKey) => void;
  setSpreadsheet: (spreadsheet: SpreadsheetStoreState["cells"]) => void;
  setDependencies: (spreadsheet: SpreadsheetStoreState["cells"]) => void;
}

export type SpreadsheetStore = SpreadsheetStoreState & SpreadsheetStoreActions;

export const useSpreadsheetStore = create<SpreadsheetStore>()((set, _get) => {
  return {
    currentSheetKey: null,
    cells: {},
    dependencies: {},

    setCurrentSheetKey(sheetKey) {
      set(() => ({ currentSheetKey: sheetKey }));
    },
    setCellValue(sheetKey, cellKey, cellValue) {
      set((state) => {
        const cells = structuredClone(state.cells);
        _.set(cells, [sheetKey, cellKey], cellValue);

        hfService.setCellContents(sheetKey, cellKey, cellValue.value);

        function reCalcDependencies(dependencies: DependencyValue[]) {
          dependencies.forEach(({ sheetKey, cellKey }) => {
            const formula = _.get(cells, [sheetKey, cellKey, "formula"])!;
            const value = hfService.calcFormula(formula, sheetKey);
            _.set(cells, [sheetKey, cellKey, "value"], value);
            hfService.setCellContents(sheetKey, cellKey, String(value));

            const _dependencies = _.get(
              state.dependencies,
              [sheetKey, cellKey],
              []
            );
            reCalcDependencies(_dependencies);
          });
        }

        const dependencies = _.get(state.dependencies, [sheetKey, cellKey], []);
        reCalcDependencies(dependencies);

        return { cells };
      });
    },
    setSpreadsheet(cells) {
      set(() => {
        const updatedCells = structuredClone(cells);

        Object.entries(updatedCells).forEach(([sheetKey, sheetCells]) => {
          Object.entries(sheetCells).forEach(([cellKey, cellValue]) => {
            hfService.setCellContents(sheetKey, cellKey, cellValue.value);
          });
        });

        return { cells: updatedCells };
      });
    },
    setDependencies(spreadsheet) {
      set(() => {
        const dependencies: SpreadsheetStore["dependencies"] = {};

        Object.entries(spreadsheet).forEach(([sheetKey, cells]) => {
          Object.entries(cells).forEach(([cellKey, cellValue]) => {
            if (!isFormula(cellValue.formula)) return;

            extractDependencies(cellValue.formula!, sheetKey).forEach(
              (dependency) => {
                _.update(
                  dependencies,
                  [dependency.sheetKey, dependency.cellKey],
                  (refs = []) => [...refs, { sheetKey, cellKey }]
                );
              }
            );
          });
        });

        return { dependencies };
      });
    },
  };
});
