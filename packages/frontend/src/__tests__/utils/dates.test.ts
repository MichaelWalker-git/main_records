import { describe, it, expect } from 'vitest';
import { formatDateOnly } from '../../utils/dates';

describe('formatDateOnly', () => {
  it('renders an ISO date without timezone shifting', () => {
    // Pre-fix this would produce 'Sep 14, 1917' in any UTC-N timezone because
    // `new Date('1917-09-15')` parses as 00:00 UTC and clock-shifts back.
    expect(formatDateOnly('1917-09-15')).toBe('Sep 15, 1917');
  });

  it('truncates a full ISO timestamp to the date portion', () => {
    expect(formatDateOnly('2026-01-31T22:00:00.000Z')).toBe('Jan 31, 2026');
  });

  it('returns null for missing or unparseable input', () => {
    expect(formatDateOnly(undefined)).toBeNull();
    expect(formatDateOnly(null)).toBeNull();
    expect(formatDateOnly('')).toBeNull();
    expect(formatDateOnly('not-a-date')).toBeNull();
  });

  it('honours a custom format string', () => {
    expect(formatDateOnly('2026-05-29', 'yyyy-MM-dd')).toBe('2026-05-29');
  });
});
