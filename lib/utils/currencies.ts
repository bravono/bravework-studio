export const currencies = ["NGN", "USD", "GBP", "EUR"] as const;
export type Currency = typeof currencies[number];
