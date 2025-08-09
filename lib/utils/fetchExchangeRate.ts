import { getCurrency } from "lib/utils/getCurrency";

export async function fetchExchangeRates() {
  try {
    const result = await getCurrency(1); // Get rates for $1
    return {
      USD: 1,
      GBP: result.rates.GBP,
      EUR: result.rates.EUR,
      NGN: 1550,
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Fallback to mock data if needed
    return {
      USD: 1,
      NGN: 1550,
      GBP: 0.00053,
      EUR: 0.00061,
    };
  }
}
