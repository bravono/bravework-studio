import { getCurrency } from "@/lib/utils/getCurrencyRate";

export async function fetchExchangeRates() {
  try {
    const result = await getCurrency(1); // Get rates for 1 naira
    return {
      NGN: result.rates.NGN,
      USD: result.rates.USD,
      GBP: result.rates.GBP,
      EUR: result.rates.EUR,
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Fallback to mock data if needed
    return {
      NGN: 1,
      USD: 0.00065,
      GBP: 0.00053,
      EUR: 0.00061,
    };
  }
}
