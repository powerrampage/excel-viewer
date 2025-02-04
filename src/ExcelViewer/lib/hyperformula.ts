import { HyperFormula, RawCellContent } from "hyperformula";
import { CellKey, SheetKey } from "../store";
import { parseCellKey } from "../utils";

globalThis.hf = HyperFormula.buildEmpty({
  licenseKey: "gpl-v3",
});

export const hfService = {
  getSheetId(sheetKey: SheetKey) {
    return (hf.getSheetId(sheetKey) ?? hf.getSheetId(hf.addSheet(sheetKey)))!;
  },
  setCellContents(sheetKey: SheetKey, cellKey: CellKey, value: RawCellContent) {
    const sheetId = this.getSheetId(sheetKey);
    const { row, col } = parseCellKey(cellKey);
    hf.setCellContents({ sheet: sheetId!, col, row }, value);
  },
  calcFormula(formula: string, sheetKey: SheetKey) {
    return hf.calculateFormula(formula, this.getSheetId(sheetKey));
  },
};
