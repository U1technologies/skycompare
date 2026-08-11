/**
 * Calendar-date helpers for the search forms.
 *
 * These read the date in the visitor's own timezone, and deliberately avoid
 * Date#toISOString, which converts to UTC first.
 *
 * That difference is not cosmetic. India is UTC+5:30, so every local hour
 * between midnight and 05:30 still falls on the previous UTC day: a form
 * defaulting to "today" through toISOString showed *yesterday* to anyone
 * searching late at night, and a check-in date in the past is a search KAYAK
 * cannot fulfil. West of UTC the same call fails the other way, showing
 * tomorrow through the evening. Every market we send traffic to has this
 * window, so the local calendar date is the only correct reading.
 */

/** yyyy-mm-dd for a Date, read in the visitor's own timezone. */
export function toIsoDate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Today's calendar date where the visitor is. */
export function today(): string {
  return toIsoDate(new Date());
}

/**
 * Today plus `n` days where the visitor is. Date#setDate carries across month
 * and year boundaries and stays on the intended calendar day through daylight
 * saving changes.
 */
export function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toIsoDate(d);
}
