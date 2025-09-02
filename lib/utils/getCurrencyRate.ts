export async function getCurrency(amount: number) {
  const apiKey = process.env.NEXT_PUBLIC_CURRENCY_API_KEY;
  const url = ` https://open.er-api.com/v6/latest/NGN`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await res.json();
  const rates = data.data; // Note: ExchangeRateAPI returns rates under `data`
  console.log("Data: ", data);

  return {
    amount,
    conversions: {
      NGN: amount * rates.NGN,
      USD: amount * rates.USD,
      GBP: amount * rates.GBP,
      EUR: amount * rates.EUR,
    },
    rates,
  };
}
