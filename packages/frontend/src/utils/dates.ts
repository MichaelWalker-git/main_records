import { format } from 'date-fns';

// Render a PG `date`-typed value (ISO yyyy-MM-dd, no time component) without
// timezone shifting. `new Date('1917-09-15')` parses as UTC midnight which
// shifts back a day in negative-UTC zones; pinning to mid-day local sidesteps
// the off-by-one without dragging in date-fns-tz.
export function formatDateOnly(value: string | null | undefined, pattern = 'MMM d, yyyy'): string | null {
  if (!value) return null;
  const dateOnly = value.length >= 10 ? value.slice(0, 10) : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
  const local = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(local.getTime())) return null;
  return format(local, pattern);
}
