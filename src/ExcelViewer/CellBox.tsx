import { FC, memo, useState } from "react";
import { Cell } from "./types";
import { getCellStyles, getCellAddress, isFormula } from "./utils";
import { CellKey, CellValue, SheetKey, useSpreadsheetStore } from "./store";
import deepEqual from "deep-equal";

export interface CellBoxProps {
  cell: Cell;
  cellKey: CellKey;
  sheetKey: SheetKey;
}

const equalityFn = (a: CellValue, b: CellValue) => {
  return Object.is(a?.formula, b?.formula) && Object.is(a?.value, b?.value);
};

const CellBox: FC<CellBoxProps> = ({ cell, cellKey, sheetKey }) => {
  const [isEdit, setIsEdit] = useState(false);
  const setCellValue = useSpreadsheetStore((state) => state.setCellValue);
  const stateCell = useSpreadsheetStore(
    (state) => state.cells?.[sheetKey]?.[cellKey],
    equalityFn
  );

  const state = stateCell ?? {
    formula: cell.formula,
    value: cell.value,
  };

  const onHandleCell = (value: string) => {
    if (!isFormula(value)) {
      setCellValue(sheetKey, cellKey, { value, formula: null });
    }
    setIsEdit(false);
  };

  return (
    <td
      data-key={cellKey}
      aria-label={getCellAddress(cell.rowIndex, cell.columnIndex)}
      data-cell={JSON.stringify(cell)}
      contentEditable
      suppressContentEditableWarning
      style={getCellStyles(cell)}
      onBlur={(event) => {
        const value = event.currentTarget.textContent;
        value && onHandleCell(value);
      }}
      onFocus={() => setIsEdit(true)}
    >
      {isEdit && isFormula(state.formula) ? state.formula : state.value}
    </td>
  );
};

export default memo(CellBox, (prevProps, nextProps) => {
  return deepEqual(prevProps, nextProps);
});
