export async function getCurrency(amount: number) {
  const apiKey = process.env.NEXT_PUBLIC_CURRENCY_API_KEY;
  const url = ` https://open.er-api.com/v6/latest/NGN`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await res.json();
  const rates = data.rates; // Note: open.er-api.com returns rates under `rates`
  console.log("Data: ", data);

  if (!rates) {
    throw new Error("Invalid response from exchange rate API");
  }

  return {
    amount,
    conversions: {
      NGN: amount * (rates.NGN ?? 1),
      USD: amount * (rates.USD ?? 0),
      GBP: amount * (rates.GBP ?? 0),
      EUR: amount * (rates.EUR ?? 0),
    },
    rates,
  };
}
