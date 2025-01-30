import { FC, useState } from "react";
import { Cell } from "./types";
import { getCellStyles, isFormula } from "./utils";
import { useCellStore } from "./store";
import { useShallow } from "zustand/shallow";

export interface CellBoxProps {
  cell: Cell;
  cellRef: string;
}

const CellBox: FC<CellBoxProps> = ({ cell, cellRef }) => {
  const [isEdit, setIsEdit] = useState(false);
  const stateCell = useCellStore(useShallow((state) => state.cells?.[cellRef]));
  const dispatchCell = useCellStore((state) => state.setCell);

  const state = stateCell ?? {
    formula: cell.formula,
    value: cell.value,
  };

  const onChange = (value: string) => {
    if (isFormula(value)) {
      // dispatchFormula(cellRef, value);
    } else {
      dispatchCell(cellRef, { value, formula: null });
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
      onBlur={(event) => onChange(event.currentTarget.textContent ?? "")}
      onFocus={() => setIsEdit(true)}
    >
      {isEdit && isFormula(state.formula) ? state.formula : state.value}
    </td>
  );
};

export default CellBox;
