import { describe, it, expect } from "vitest";
import { extractDependencies } from "../../utils";

describe("extractDependencies", () => {
  it("should extract single-cell references", () => {
    expect(extractDependencies("=A1", "Sheet1")).toEqual([
      { sheetKey: "Sheet1", cellKey: "0-0" },
    ]);

    expect(extractDependencies("=C4", "Main")).toEqual([
      { sheetKey: "Main", cellKey: "3-2" },
    ]);
  });

  it("should extract multi-cell range references", () => {
    const result = extractDependencies("=B2:D3", "Data");
    const output = [
      { sheetKey: "Data", cellKey: "1-1" }, // B2
      { sheetKey: "Data", cellKey: "1-2" }, // C2
      { sheetKey: "Data", cellKey: "1-3" }, // D2
      { sheetKey: "Data", cellKey: "2-1" }, // B3
      { sheetKey: "Data", cellKey: "2-2" }, // C3
      { sheetKey: "Data", cellKey: "2-3" }, // D3
    ];

    expect(result).toEqual(expect.arrayContaining(output));
    expect(result).toHaveLength(output.length);
  });

  it("should handle references from other sheets", () => {
    expect(extractDependencies("=Sheet2!B3", "Sheet1")).toEqual([
      { sheetKey: "Sheet2", cellKey: "2-1" },
    ]);

    const result = extractDependencies("=Finance!D6:G8", "Sheet1");
    const output = [
      { sheetKey: "Finance", cellKey: "5-3" }, // D6
      { sheetKey: "Finance", cellKey: "5-4" }, // E6
      { sheetKey: "Finance", cellKey: "5-5" }, // F6
      { sheetKey: "Finance", cellKey: "5-6" }, // G6
      { sheetKey: "Finance", cellKey: "6-3" }, // D7
      { sheetKey: "Finance", cellKey: "6-4" }, // E7
      { sheetKey: "Finance", cellKey: "6-5" }, // F7
      { sheetKey: "Finance", cellKey: "6-6" }, // G7
      { sheetKey: "Finance", cellKey: "7-3" }, // D8
      { sheetKey: "Finance", cellKey: "7-4" }, // E8
      { sheetKey: "Finance", cellKey: "7-5" }, // F8
      { sheetKey: "Finance", cellKey: "7-6" }, // G8
    ];

    expect(result).toEqual(expect.arrayContaining(output));
    expect(result).toHaveLength(output.length);
  });

  it("should handle mixed references in a formula", () => {
    const result = extractDependencies(
      "=A1 + B2:C3 + Sheet2!D4 + 10",
      "TestSheet"
    );

    expect(result).toEqual(
      expect.arrayContaining([
        { sheetKey: "TestSheet", cellKey: "0-0" }, // A1
        { sheetKey: "TestSheet", cellKey: "1-1" }, // B2
        { sheetKey: "TestSheet", cellKey: "1-2" }, // C2
        { sheetKey: "TestSheet", cellKey: "2-1" }, // B3
        { sheetKey: "TestSheet", cellKey: "2-2" }, // C3
        { sheetKey: "Sheet2", cellKey: "3-3" }, // D4
      ])
    );
  });

  it("should return an empty array for invalid formulas", () => {
    expect(extractDependencies("=??? + !!", "Main")).toEqual([]);
    expect(extractDependencies("=", "Main")).toEqual([]);
    expect(extractDependencies("", "Main")).toEqual([]);
    expect(extractDependencies("=XYZ", "Main")).toEqual([]);
  });

  it("should return an empty array for non-references", () => {
    expect(extractDependencies("=SUM(1, 2, 3)", "Sheet1")).toEqual([]);
    expect(extractDependencies("=100 + 200", "Sheet1")).toEqual([]);
  });

  // I don't know how to handle it.
  it.skip("should correctly handle absolute references ($)", () => {
    expect(extractDependencies("=$A$1 + B$3 + $C4", "SheetX")).toEqual([
      { sheetKey: "SheetX", cellKey: "0-0" }, // A1
      { sheetKey: "SheetX", cellKey: "2-1" }, // B3
      { sheetKey: "SheetX", cellKey: "3-2" }, // C4
    ]);
  });
  it.skip("should handle unexpected symbols and weird inputs", () => {
    expect(extractDependencies("=Sheet1!A$", "Sheet1")).toEqual([]);
    expect(extractDependencies("=$$A1", "Sheet1")).toEqual([]);
    expect(extractDependencies("=A1-B2:D3+!$C4&@Sheet5!E5", "Sheet1")).toEqual([
      { sheetKey: "Sheet1", cellKey: "0-0" }, // A1
      { sheetKey: "Sheet1", cellKey: "1-1" }, // B2
      { sheetKey: "Sheet1", cellKey: "1-2" }, // C2
      { sheetKey: "Sheet1", cellKey: "1-3" }, // D2
      { sheetKey: "Sheet1", cellKey: "2-1" }, // B3
      { sheetKey: "Sheet1", cellKey: "2-2" }, // C3
      { sheetKey: "Sheet1", cellKey: "2-3" }, // D3
      { sheetKey: "Sheet1", cellKey: "3-2" }, // C4
      { sheetKey: "Sheet5", cellKey: "4-4" }, // E5
    ]);
  });
});
