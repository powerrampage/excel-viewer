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
    if (!isFormula(value) && state.value !== value) {
      setCellValue(sheetKey, cellKey, { value, formula: state.formula });
    }
    setIsEdit(false);
  };

  return (
    <td
      data-key={cellKey}
      aria-label={getCellAddress(cell.rowIndex, cell.columnIndex)}
      data-cell={JSON.stringify(cell)}
      contentEditable={cell.editable}
      suppressContentEditableWarning
      style={getCellStyles(cell)}
      colSpan={cell.columnSpan || 1}
      rowSpan={cell.rowSpan || 1}
      onBlur={(event) => {
        const value = event.currentTarget.textContent ?? "";
        onHandleCell(value);
      }}
      onFocus={() => setIsEdit(true)}
    >
      {(() => {
        if (isEdit && isFormula(state.formula)) {
          return state.formula;
        }
        return state.value;
      })()}
    </td>
  );
};

export default memo(CellBox, (prevProps, nextProps) => {
  return deepEqual(prevProps, nextProps);
});
