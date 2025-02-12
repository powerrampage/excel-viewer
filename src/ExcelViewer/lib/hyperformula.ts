import { HyperFormula, RawCellContent } from "hyperformula";
import ruRU from "hyperformula/i18n/languages/ruRU";
import { CellKey, SheetKey } from "../store";
import { parseCellKey } from "../utils";

HyperFormula.registerLanguage("ruRU", ruRU);

globalThis.hf = HyperFormula.buildEmpty({
  licenseKey: "gpl-v3",
  language: "ruRU",
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
