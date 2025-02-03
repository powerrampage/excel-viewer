import { SheetKey, SpreadsheetStoreState } from "./store";
import { Parser as FormulaParser } from "hot-formula-parser";
import { extractVariables, parseInt } from "./utils";

const formulaParser = new FormulaParser();
let data: SpreadsheetStoreState["cells"] = {};
let currentSheetKey: SheetKey;

formulaParser.on("callCellValue", ({ label }, done) => {
  const cellKey = data[currentSheetKey][label];
  console.log("callCellValue:", cellKey.value);
  done(cellKey.value);
});
formulaParser.on("callRangeValue", (startCellCoord, endCellCoord, done) => {
  const rangeKey = `${startCellCoord.label}:${endCellCoord.label}`;
  const variables = extractVariables(rangeKey);
  const rangeValues = variables
    .map((variable) => parseInt(data[currentSheetKey][variable].value))
    .filter(Boolean);

  console.log("callRangeValue:", rangeValues);
  done(rangeValues);
});

export function evaluateFormula(
  formula: string,
  sheetKey: SheetKey,
  cells: SpreadsheetStoreState["cells"]
) {
  currentSheetKey = sheetKey;
  data = cells; // IDK other approach

  let expression = formula.slice(1);
  const { result, error } = formulaParser.parse(expression);

  console.log({ result, error });

  if (error === null) {
    return String(result);
  } else {
    return error;
  }
}
