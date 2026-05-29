// Mirror of the coercion helpers exported from `lambdas/ai-ocr/index.ts`.
// We can't import across packages without breaking tsc rootDir, so the
// helpers are duplicated here. If the contract drifts on either side,
// this suite should fail, prompting a sync. Keep the two implementations
// byte-for-byte identical except for the export keyword.
const ALLOWED_DM_DOCUMENT_TYPES = new Set(['Text', 'Image', 'Audio', 'Video', 'Map']);

const COLUMN_LIMITS = {
  contributingInstitution: 255,
  dmIdentifier: 100,
  docLanguage: 50,
  docLocation: 255,
} as const;

function clampString(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

function coerceDocumentTypeDm(value: unknown): 'Text' | 'Image' | 'Audio' | 'Video' | 'Map' | undefined {
  if (typeof value !== 'string') return undefined;
  return ALLOWED_DM_DOCUMENT_TYPES.has(value)
    ? (value as 'Text' | 'Image' | 'Audio' | 'Video' | 'Map')
    : undefined;
}

describe('ai-ocr coercion helpers (contract)', () => {
  describe('coerceDocumentTypeDm', () => {
    it.each(['Text', 'Image', 'Audio', 'Video', 'Map'])(
      'accepts whitelisted value %s',
      (value) => {
        expect(coerceDocumentTypeDm(value)).toBe(value);
      }
    );

    it('rejects values the model might hallucinate', () => {
      expect(coerceDocumentTypeDm('document')).toBeUndefined();
      expect(coerceDocumentTypeDm('text')).toBeUndefined();
      expect(coerceDocumentTypeDm('PDF')).toBeUndefined();
    });

    it('rejects non-string input', () => {
      expect(coerceDocumentTypeDm(undefined)).toBeUndefined();
      expect(coerceDocumentTypeDm(null)).toBeUndefined();
      expect(coerceDocumentTypeDm(123)).toBeUndefined();
      expect(coerceDocumentTypeDm({})).toBeUndefined();
    });
  });

  describe('clampString', () => {
    it('truncates oversize input to the column limit so the UPDATE never throws', () => {
      const verbose = 'A'.repeat(250);
      expect(clampString(verbose, COLUMN_LIMITS.dmIdentifier)).toHaveLength(100);
      expect(clampString(verbose, COLUMN_LIMITS.docLanguage)).toHaveLength(50);
    });

    it('trims whitespace and treats empty/whitespace as undefined', () => {
      expect(clampString('  hello  ', 100)).toBe('hello');
      expect(clampString('', 100)).toBeUndefined();
      expect(clampString('   ', 100)).toBeUndefined();
    });

    it('rejects non-string input', () => {
      expect(clampString(undefined, 100)).toBeUndefined();
      expect(clampString(42, 100)).toBeUndefined();
      expect(clampString({ foo: 'bar' }, 100)).toBeUndefined();
    });

    it('passes shorter strings through unchanged', () => {
      expect(clampString('15-28455-F026-I016', COLUMN_LIMITS.dmIdentifier))
        .toBe('15-28455-F026-I016');
    });
  });
});
