import { describe, it, expect } from "vitest";
import { getCellAddress } from "../../utils";

describe("getCellAddress", () => {
  it("should return correct cell address for basic cases", () => {
    expect(getCellAddress(0, 0)).toBe("A1");
    expect(getCellAddress(1, 1)).toBe("B2");
    expect(getCellAddress(4, 3)).toBe("D5");
    expect(getCellAddress(25, 25)).toBe("Z26");
  });

  it("should handle multi-letter columns", () => {
    expect(getCellAddress(0, 26)).toBe("AA1");
    expect(getCellAddress(10, 27)).toBe("AB11");
    expect(getCellAddress(50, 51)).toBe("AZ51");
    expect(getCellAddress(99, 702)).toBe("AAA100");
  });

  it("should handle negative indices gracefully", () => {
    expect(() => getCellAddress(-1, 0)).toThrow();
    expect(() => getCellAddress(0, -1)).toThrow();
  });

  it("should handle extremely large numbers", () => {
    expect(getCellAddress(1048575, 16383)).toBe("XFD1048576"); // Max Excel cell (XFD1048576)
  });

  it("should handle non-numeric inputs", () => {
    // @ts-expect-error Forcing incorrect types for testing
    expect(() => getCellAddress("hello", 5)).toThrow();
    // @ts-expect-error
    expect(() => getCellAddress(3, "world")).toThrow();
    // @ts-expect-error
    expect(() => getCellAddress(undefined, null)).toThrow();
  });
});
