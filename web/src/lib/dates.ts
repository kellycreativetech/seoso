// All SEOSO events happen in Ohio; always format in Eastern Time regardless of server TZ.
const TZ = "America/New_York";

const part = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...options }).format(date);

// "7 pm", "10:15 am"
export function formatTime(date: Date) {
  return part(date, { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(":00", "")
    .replace(/\s?AM$/, " am")
    .replace(/\s?PM$/, " pm");
}

export function eventDateParts(iso: string) {
  const date = new Date(iso);
  return {
    day: part(date, { day: "numeric" }),
    month: part(date, { month: "short" }),
    weekday: part(date, { weekday: "short" }),
    year: part(date, { year: "numeric" }),
    time: formatTime(date),
    long: part(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
  };
}

export function formatDate(iso: string) {
  return part(new Date(iso), { month: "long", day: "numeric", year: "numeric" });
}
