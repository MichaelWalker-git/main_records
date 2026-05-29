import { describe, it, expect } from 'vitest';
import { transformKeys, transformKeysToSnake } from '../../services/api';

describe('api request key transformation', () => {
  it('round-trips digits adjacent to letters (agency3 <-> agency_3)', () => {
    const camel = { agency3: 'AAA' };
    const snake = transformKeysToSnake(camel) as Record<string, unknown>;
    expect(snake.agency_3).toBe('AAA');
    const back = transformKeys(snake) as Record<string, unknown>;
    expect(back.agency3).toBe('AAA');
  });

  it('handles every field the EditRecordPage payload sends', () => {
    const payload = {
      title: 'X',
      seriesTitle: 'Y',
      mediaType: 'PHYSICAL',
      containerNumber: 'BOX-1',
      boxNumber: '0001',
      locationCode: '01010101',
      umbrella: 'Exec',
      unit: 'A',
      subunit: 'B',
      agency3: 'DOT',
      trNumber: 'T-1',
      dispoDate: '2030-01-01',
      rfidEnabled: false,
      contributingInstitution: 'Maine State Archives',
      documentTypeDm: 'Text' as const,
      dmIdentifier: '15-28455-F026-I016',
      exactCreationDate: '1917-09-15',
      docLanguage: 'English',
      docLocation: 'Portland, ME',
      keywords: ['Maine', 'World War I'],
      recommendedCitation: 'Grant (1917).',
    };

    const snake = transformKeysToSnake(payload) as Record<string, unknown>;

    // Critical: all .strict()-validated keys must map to existing column names.
    expect(snake).toMatchObject({
      title: 'X',
      series_title: 'Y',
      media_type: 'PHYSICAL',
      container_number: 'BOX-1',
      box_number: '0001',
      location_code: '01010101',
      umbrella: 'Exec',
      unit: 'A',
      subunit: 'B',
      agency_3: 'DOT',
      tr_number: 'T-1',
      dispo_date: '2030-01-01',
      rfid_enabled: false,
      contributing_institution: 'Maine State Archives',
      document_type_dm: 'Text',
      dm_identifier: '15-28455-F026-I016',
      exact_creation_date: '1917-09-15',
      doc_language: 'English',
      doc_location: 'Portland, ME',
      keywords: ['Maine', 'World War I'],
      recommended_citation: 'Grant (1917).',
    });

    // No camelCase leakage that would trigger zod .strict() rejection.
    const camelLeaks = Object.keys(snake).filter((k) => /[A-Z]/.test(k));
    expect(camelLeaks).toEqual([]);
  });

  it('snake -> camel response also handles agency_3 -> agency3', () => {
    const fromBackend = {
      agency_3: 'DOT',
      tr_number: 'T-1',
      contributing_institution: 'Maine State Archives',
      document_type_dm: 'Text',
    };
    const camel = transformKeys(fromBackend) as Record<string, unknown>;
    expect(camel.agency3).toBe('DOT');
    expect(camel.trNumber).toBe('T-1');
    expect(camel.contributingInstitution).toBe('Maine State Archives');
    expect(camel.documentTypeDm).toBe('Text');
  });

  it('recurses into nested arrays of strings (keywords stays a string array)', () => {
    const camel = { keywords: ['Maine', 'WWI'] };
    const snake = transformKeysToSnake(camel) as { keywords: string[] };
    expect(snake.keywords).toEqual(['Maine', 'WWI']);
    expect(Array.isArray(snake.keywords)).toBe(true);
  });
});
