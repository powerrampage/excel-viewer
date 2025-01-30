import { createWithEqualityFn as create } from "zustand/traditional";
import { evaluateFormula, extractDependencies } from "./formula-utils";
import { Cell } from "./types";

export type CellKey = string;
export type CellValue = Pick<Cell, "value" | "formula">;

export interface CellStoreState {
  cells: Record<CellKey, CellValue>;
  dependencies: Record<CellKey, CellKey[]>;
}

export interface CellStoreAction {
  setCell: (cellKey: CellKey, cellValue: CellValue) => void;
  setAllCells: (cells: CellStoreState["cells"]) => void;
  setDependencies: (cells: CellStoreState["cells"]) => void;
  setCellFormula: (cellKey: CellKey, cellValue: CellValue) => void;
}

export type CellStore = CellStoreState & CellStoreAction;

export const useCellStore = create<CellStore>()((set, get) => ({
  cells: {},
  dependencies: {},

  setCell: (cellKey, cellValue) =>
    set((state) => {
      const cells = { ...state.cells, [cellKey]: cellValue };

      if (state.dependencies[cellKey]?.length) {
        state.dependencies[cellKey].forEach((key) => {
          cells[key] = {
            formula: cells[key].formula,
            value: evaluateFormula(cells[key].formula!, cells),
          };
        });
      }

      return { cells };
    }),
  setDependencies(cells) {
    set(() => {
      const dependencies: CellStore["dependencies"] = {};
      Object.entries(cells).forEach(([cellKey, cellValue]) => {
        if (cellValue.formula) {
          extractDependencies(cellValue.formula).forEach((key) => {
            dependencies[key] = [cellKey];
          });
        }
      });
      return { dependencies };
    });
  },
  setAllCells(cells) {
    set(() => {
      return { cells };
    });
  },
  setCellFormula(cellKey, cellValue) {
    set((state) => {
      const cells = { ...state.cells };

      cells[cellKey] = {
        value: evaluateFormula(cellValue.formula!, state.cells),
        formula: cellValue.formula,
      };

      state.setDependencies(cells);

      return { cells };
    });
  },
}));
