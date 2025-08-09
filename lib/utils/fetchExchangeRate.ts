import { getCurrency } from "lib/utils/getCurrency";
import { ExchangeRates } from "app/types/app";

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const result = await getCurrency(1); // Get rates for $1
    return {
      USD: 1,
      GBP: result.rates.GBP,
      EUR: result.rates.EUR,
      NGN: result.rates.NGN,
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Fallback to mock data if needed
    return {
      NGN: 1,
      USD: 0.00067,
      GBP: 0.00053,
      EUR: 0.00061,
    };
  }
};