const reviewDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatReviewDate(value: string) {
  return reviewDateFormatter.format(new Date(value));
}
