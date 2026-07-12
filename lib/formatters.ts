export function formatCurrency(cents: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency
  }).format(cents / 100);
}
