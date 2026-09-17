// Keep the displayed date in Brazilian format; the API receives ISO dates.
export function maskBrazilianDate(value, previousValue = "") {
  let digits = value.replace(/\D/g, "").slice(0, 8);
  // Backspacing an automatically inserted slash also removes its preceding digit.
  if (previousValue.endsWith("/") && value === previousValue.slice(0, -1)) {
    digits = digits.slice(0, -1);
  }
  if (digits.length < 2) return digits;
  if (digits.length < 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function toISODate(value) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null;
  const [day, month, year] = value.split("/").map(Number);
  if (year < 1 || month < 1 || month > 12) return null;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < 1 || day > days[month - 1]) return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function maskTime(value, previousValue = "") {
  let digits = value.replace(/\D/g, "").slice(0, 4);
  if (previousValue.endsWith(":") && value === previousValue.slice(0, -1)) {
    digits = digits.slice(0, -1);
  }
  if (digits.length < 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}
