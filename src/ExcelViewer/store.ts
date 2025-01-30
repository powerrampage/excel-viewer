import { create } from "zustand";
import { Cell } from "./types";

type CellKey = string;
type CellValue = Pick<Cell, "value" | "formula">;

export interface CellStoreState {
  cells: Record<CellKey, CellValue>;
}

export interface CellStoreAction {
  setCell: (cellKey: CellKey, value: CellValue) => void;
  setAllCells: (cells: CellStoreState["cells"]) => void;
}

export  type CellStore = CellStoreState & CellStoreAction;

export const useCellStore = create<CellStore>()((set) => ({
  cells: {},
  setCell: (cellKey, value) =>
    set((state) => {
      state.cells[cellKey] = value;
      return {
        cells: state.cells,
      };
    }),
  setAllCells: (cells) => set(() => ({ cells })),
}));
