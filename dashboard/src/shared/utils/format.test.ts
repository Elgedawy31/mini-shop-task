import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats amounts with two decimal places", () => {
    const formatted = formatCurrency(149.5, "USD");
    expect(formatted).toContain("149.50");
  });

  it("formats zero", () => {
    const formatted = formatCurrency(0, "USD");
    expect(formatted).toContain("0.00");
  });
});
