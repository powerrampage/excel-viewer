import { FC, useState } from "react";
import { Cell } from "./types";
import { getCellStyles, isFormula } from "./utils";
import { CellValue, useCellStore } from "./store";

export interface CellBoxProps {
  cell: Cell;
  cellRef: string;
}

const equalityFn = (a: CellValue, b: CellValue) => {
  return a?.formula === b?.formula && a?.value === b?.value;
};

const CellBox: FC<CellBoxProps> = ({ cell, cellRef }) => {
  const [isEdit, setIsEdit] = useState(false);
  const stateCell = useCellStore((state) => state.cells?.[cellRef], equalityFn);
  const setCell = useCellStore((state) => state.setCell);
  const setCellFormula = useCellStore((state) => state.setCellFormula);

  const state = stateCell ?? {
    formula: cell.formula,
    value: cell.value,
  };

  const onHandleCell = (value: string) => {
    if (isFormula(value)) {
      setCellFormula(cellRef, {
        value: state.value,
        formula: value,
      });
    } else {
      setCell(cellRef, { value, formula: null });
    }
    setIsEdit(false);
  };

  return (
    <td
      data-ref={cellRef}
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

export default CellBox;

// Todo: If parent re-renders
// export default memo(CellBox, (prevProps, nextProps) => {
//   return deepEqual(prevProps, nextProps);
// });
