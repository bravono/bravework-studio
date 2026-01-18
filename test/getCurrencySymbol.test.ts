import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";

describe("getCurrencySymbol", () => {
  it("should return '$' for USD", () => {
    expect(getCurrencySymbol("USD")).toBe("$");
  });

  it("should return '₦' for NGN", () => {
    expect(getCurrencySymbol("NGN")).toBe("₦");
  });

  it("should return '£' for GBP", () => {
    expect(getCurrencySymbol("GBP")).toBe("£");
  });

  it("should return '€' for EUR", () => {
    expect(getCurrencySymbol("EUR")).toBe("€");
  });

  it("should return an empty string for unknown currency codes", () => {
    expect(getCurrencySymbol("JPY")).toBe("");
    expect(getCurrencySymbol("CAD")).toBe("");
  });
});
