import { mergeOcrIntoDescription, OCR_MARKER } from '../services/AIService';

describe('mergeOcrIntoDescription (OCR idempotency)', () => {
  it('prepends marker when description is null', () => {
    expect(mergeOcrIntoDescription(null, 'extracted')).toBe(`${OCR_MARKER}extracted`);
  });

  it('prepends marker when description is empty string', () => {
    expect(mergeOcrIntoDescription('', 'extracted')).toBe(`${OCR_MARKER}extracted`);
  });

  it('appends marker + extracted text when no prior OCR block exists', () => {
    const result = mergeOcrIntoDescription('Manual description.', 'extracted');
    expect(result).toBe(`Manual description.${OCR_MARKER}extracted`);
  });

  it('replaces existing OCR block on re-run instead of appending again', () => {
    const first = mergeOcrIntoDescription('Manual.', 'OCR_v1');
    const second = mergeOcrIntoDescription(first, 'OCR_v2');
    expect(second).toBe(`Manual.${OCR_MARKER}OCR_v2`);
    // critical: OCR_v1 must NOT survive
    expect(second).not.toContain('OCR_v1');
  });

  it('does not duplicate OCR marker on repeated runs', () => {
    let desc: string | null = 'Manual.';
    for (let i = 0; i < 5; i++) {
      desc = mergeOcrIntoDescription(desc, 'OCR text');
    }
    const occurrences = (desc!.match(/--- Extracted Content ---/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it('handles description that starts with OCR (no manual part)', () => {
    const initial = mergeOcrIntoDescription(null, 'first OCR');
    const second = mergeOcrIntoDescription(initial, 'second OCR');
    expect(second).toBe(`${OCR_MARKER}second OCR`);
    expect(second).not.toContain('first OCR');
  });

  it('truncates extracted text to 10000 chars', () => {
    const long = 'x'.repeat(15000);
    const result = mergeOcrIntoDescription(null, long);
    // marker + 10000 chars
    expect(result.length).toBe(OCR_MARKER.length + 10000);
  });
});
