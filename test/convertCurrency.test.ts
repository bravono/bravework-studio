import { convertCurrency } from "@/lib/utils/convertCurrency";

describe("convertCurrency", () => {
  const symbol = "₦";
  const rate = 1.0;

  it("should convert a single numeric amount", () => {
    expect(convertCurrency(1000, 1.0, symbol)).toBe("₦1,000");
    expect(convertCurrency(1000, 0.5, symbol)).toBe("₦500");
    expect(convertCurrency(1000, 1.5, symbol)).toBe("₦1,500");
  });

  it("should convert a numeric amount string", () => {
    expect(convertCurrency("1000", 1.0, symbol)).toBe("₦1,000");
  });

  it("should handle numeric ranges (e.g., '100 - 500')", () => {
    expect(convertCurrency("100 - 500", 1.0, symbol)).toBe("₦100 - ₦500");
    expect(convertCurrency("100 - 500", 0.5, symbol)).toBe("₦50 - ₦250");
  });

  it("should handle plus-suffixed amounts (e.g., '9000+')", () => {
    expect(convertCurrency("9000+", 1.0, symbol)).toBe("₦9,000+");
    expect(convertCurrency("9000+", 0.5, symbol)).toBe("₦4,500+");
  });

  it("should use the provided currency symbol", () => {
    expect(convertCurrency(1000, 1.0, "$")).toBe("$1,000");
    expect(convertCurrency("100 - 500", 1.0, "€")).toBe("€100 - €500");
  });

  it("should round the converted amount", () => {
    expect(convertCurrency(1000, 1.2345, symbol)).toBe("₦1,235");
    expect(convertCurrency(1000, 1.2344, symbol)).toBe("₦1,234");
  });
});
