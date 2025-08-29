// hooks/useExchangeRates.ts
import { useEffect, useState } from "react";
import { getCurrency } from "@/lib/utils/getCurrencyRate";
import { ExchangeRates } from "@/app/types/app";

const STORAGE_KEY = "exchangeRates";

const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const result = await getCurrency(1);
    return {
      USD: 1,
      GBP: result.rates.GBP,
      EUR: result.rates.EUR,
      NGN: 1550,
    };
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return {
      USD: 1,
      NGN: 1550,
      GBP: 0.00053,
      EUR: 0.00061,
    };
  }
};

const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null
  );
  const [ratesLoading, setRatesLoading] = useState<boolean>(false);
  const [ratesError, setRatesError] = useState<string | null>(null);

  useEffect(() => {
    const getRates = async () => {
      setRatesLoading(true);

      const cachedRates = sessionStorage.getItem(STORAGE_KEY);
      if (cachedRates) {
        setExchangeRates(JSON.parse(cachedRates));
        setRatesLoading(false);
        return;
      }

      try {
        const rates = await fetchExchangeRates();
        setExchangeRates(rates);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
        setRatesError(null);

        console.log("Fetched exchange rates:", rates);
      } catch (err) {
        console.error("Error fetching exchange rates:", err);
        setRatesError("Failed to load exchange rates.");
      } finally {
        setRatesLoading(false);
      }
    };

    getRates();
  }, []);

  return { exchangeRates, ratesLoading, ratesError };
};

export default useExchangeRates;
