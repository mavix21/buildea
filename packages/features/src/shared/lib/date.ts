export interface RelativeDateLabels {
  today: string;
  tomorrow: string;
}

export interface FormattedDateLabel {
  date: string;
  weekday: string;
}

export function formatTimeByLocale(dateMs: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateMs));
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDateWithCapitalizedMonth(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
    .formatToParts(date)
    .map((part) =>
      part.type === "month" ? capitalize(part.value) : part.value,
    )
    .join("");
}

export function formatRelativeDateLabel(
  dateMs: number,
  nowMs: number,
  locale: string,
  relativeLabels: RelativeDateLabels,
): FormattedDateLabel {
  const date = new Date(dateMs);
  const weekday = capitalize(
    new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
  );

  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) {
    return { date: relativeLabels.today, weekday };
  }

  if (date.getTime() === tomorrow.getTime()) {
    return { date: relativeLabels.tomorrow, weekday };
  }

  const datePart = formatDateWithCapitalizedMonth(date, locale);

  return { date: datePart, weekday };
}
