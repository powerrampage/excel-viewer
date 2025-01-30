import { CellKey, CellValue } from "./store";
import { isFormula } from "./utils";

export function extractDependencies(formula: string): string[] {
  if (!isFormula(formula)) return [];

  const regex = /[A-Z]+\d+(:[A-Z]+\d+)?/g;
  const matches = formula.match(regex) || [];

  let expanded: string[] = [];

  matches.forEach((match) => {
    if (match.includes(":")) {
      const [start, end] = match.split(":");
      const [startCol, startRow] = [
        start.replace(/\d+/g, ""),
        Number(start.replace(/\D+/g, "")),
      ];
      const [_endCol, endRow] = [
        end.replace(/\d+/g, ""),
        Number(end.replace(/\D+/g, "")),
      ];

      for (let i = startRow; i <= endRow; i++) {
        expanded.push(`${startCol}${i}`);
      }
    } else {
      expanded.push(match);
    }
  });

  return expanded;
}

// ⚠️ Todo: Use library to implement math formula
export function evaluateFormula(
  formula: string,
  cells: Record<CellKey, CellValue>
) {
  let expression = formula.slice(1);
  for (const ref of extractDependencies(formula)) {
    const value = cells[ref]?.value ?? "0";
    expression = expression.replace(ref, value);
  }

  try {
    return eval(expression);
  } catch {
    return "ERROR";
  }
}
