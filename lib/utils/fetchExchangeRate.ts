import { getCurrency } from "@/lib/utils/getCurrencyRate";

export async function fetchExchangeRates() {
  try {
    const result = await getCurrency(1); // Get rates for 1 naira
    return {
      NGN: result.rates?.NGN ?? 1,
      USD: result.rates?.USD ?? 0.00065,
      GBP: result.rates?.GBP ?? 0.00053,
      EUR: result.rates?.EUR ?? 0.00061,
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
