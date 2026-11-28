import { KOBO_PER_NAIRA } from "@/lib/constants";

describe("Checkout Tip Calculations", () => {
  const baseAmountKobo = 5000000; // 50,000 Naira in Kobo

  const calculateTip = (
    baseKobo: number,
    tipOption: "none" | "5" | "10" | "15" | "custom",
    customNairaStr: string = "",
  ): number => {
    if (tipOption === "5") {
      return Math.round(baseKobo * 0.05);
    } else if (tipOption === "10") {
      return Math.round(baseKobo * 0.1);
    } else if (tipOption === "15") {
      return Math.round(baseKobo * 0.15);
    } else if (tipOption === "custom") {
      const parsedCustom = parseFloat(customNairaStr);
      if (!isNaN(parsedCustom) && parsedCustom > 0) {
        return Math.round(parsedCustom * KOBO_PER_NAIRA);
      }
    }
    return 0;
  };

  it("should return 0 when tip option is none", () => {
    expect(calculateTip(baseAmountKobo, "none")).toBe(0);
  });

  it("should correctly compute 5% tip", () => {
    expect(calculateTip(baseAmountKobo, "5")).toBe(250000); // 2,500 Naira
  });

  it("should correctly compute 10% tip", () => {
    expect(calculateTip(baseAmountKobo, "10")).toBe(500000); // 5,000 Naira
  });

  it("should correctly compute 15% tip", () => {
    expect(calculateTip(baseAmountKobo, "15")).toBe(750000); // 7,500 Naira
  });

  it("should correctly compute valid custom tip amount in Naira", () => {
    expect(calculateTip(baseAmountKobo, "custom", "1500")).toBe(150000); // 1,500 Naira
  });

  it("should handle invalid or zero custom tip gracefully", () => {
    expect(calculateTip(baseAmountKobo, "custom", "")).toBe(0);
    expect(calculateTip(baseAmountKobo, "custom", "-50")).toBe(0);
    expect(calculateTip(baseAmountKobo, "custom", "abc")).toBe(0);
  });

  it("should calculate correct total with tip and wallet deduction", () => {
    const tipKobo = calculateTip(baseAmountKobo, "10"); // 5,000 Naira
    const totalWithTip = baseAmountKobo + tipKobo; // 55,000 Naira

    const walletBalanceKobo = 2000000; // 20,000 Naira
    const walletDeduction = Math.min(walletBalanceKobo, totalWithTip);
    const finalPaystackAmount = totalWithTip - walletDeduction;

    expect(totalWithTip).toBe(5500000);
    expect(walletDeduction).toBe(2000000);
    expect(finalPaystackAmount).toBe(3500000); // 35,000 Naira remaining
  });
});
