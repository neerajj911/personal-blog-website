const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-10-21" -> "Oct 21, 2026". Dates are calendar dates, so UTC avoids off-by-one days. */
export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

/** 11 -> "11 min read" */
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
