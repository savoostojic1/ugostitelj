export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("sr-ME", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
