// hooks/useCurrency.ts
import { useEffect, useState } from "react";

type Currency = "NGN" | "USD" | "GBP" | "EUR";

const useSelectedCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD"); // default

  useEffect(() => {
    const saved = localStorage.getItem("currency") as Currency | null;
    if (saved) setSelectedCurrency(saved);
  }, []);

  const updateSelectedCurrency = (newCurrency: Currency) => {
    setSelectedCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  return { selectedCurrency, updateSelectedCurrency };
};

export default useSelectedCurrency;
