export async function getCurrency(amount: number) {
  const apiKey = process.env.NEXT_PUBLIC_CURRENCY_API_KEY;
  const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await res.json();
  const rates = data.data; // Note: FreeCurrencyAPI returns rates under `data`

  return {
    amount,
    conversions: {
      USD: amount * rates.USD,
      GBP: amount * rates.GBP,
      EUR: amount * rates.EUR,
      NGN: amount * 1550
    },
    rates,
  };
}
