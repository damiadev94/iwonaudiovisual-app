/**
 * Formats a promo end date for display in Argentina timezone.
 * Example output: "17 jun 2026"
 */
export function formatPromoEndDate(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
