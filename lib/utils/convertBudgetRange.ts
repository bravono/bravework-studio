export function convertBudgetRange(
  range: string,
  rate: number,
  symbol: string
): string {
  if (range.includes("+")) {
    // Handle "9000+" format
    const baseStr = range.replace("+", "").trim();
    const base = parseFloat(baseStr);
    const convertedBase = Math.round(base * rate).toLocaleString();
    return `${symbol}${convertedBase}+`;
  }

  // Handle "100 - 500" format
  const [minStr, maxStr] = range.split("-").map((s) => s.trim());
  const min = parseFloat(minStr);
  const max = parseFloat(maxStr);

  const convertedMin = Math.round(min * rate).toLocaleString();
  const convertedMax = Math.round(max * rate).toLocaleString();

  return `${symbol}${convertedMin} - ${symbol}${convertedMax}`;
}