export function convertCurrency(
  amount: any,
  rate: number,
  symbol: string
): string {
  const amountStr = amount.toString();

  if (amountStr.includes("-")) {
    // Handle "100 - 500" format
    const [minStr, maxStr] = amountStr.split("-").map((s) => s.trim());
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    const convertedMin = Math.round(min * rate).toLocaleString();
    const convertedMax = Math.round(max * rate).toLocaleString();

    return `${symbol}${convertedMin} - ${symbol}${convertedMax}`;
  }

  if (amountStr.includes("+")) {
    // Handle "9000+" format
    const baseStr = amountStr.replace("+", "").trim();
    const base = parseFloat(baseStr);
    const convertedBase = Math.round(base * rate).toLocaleString();
    return `${symbol}${convertedBase}+`;
  }

  const convertedValue = Math.round(
    parseFloat(amountStr) * rate
  ).toLocaleString();
  return `${symbol}${convertedValue}`;
}
