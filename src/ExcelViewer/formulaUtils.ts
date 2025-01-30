import { isFormula } from "./utils";

export function extractDependencies(formula: string): string[] {
  if(!isFormula(formula)) return [];

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
      const [endCol, endRow] = [
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
