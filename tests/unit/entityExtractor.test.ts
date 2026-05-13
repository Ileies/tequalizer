import { describe, it, expect } from 'vitest';
import { extractEntities } from '../../src/fidelity/entityExtractor.ts';

describe('extractEntities', () => {
  describe('numbers', () => {
    it('extracts plain integers', () => {
      const { numbers } = extractEntities('Es gibt 42 Arten von Fehlern.');
      expect(numbers).toContain('42');
    });

    it('extracts numbers with units', () => {
      const { numbers } = extractEntities('Das Produkt kostet 19,99 € und wiegt 2 kg.');
      expect(numbers.some((n) => n.includes('19') && n.includes('99'))).toBe(true);
    });

    it('does not count date digits as standalone numbers', () => {
      const { numbers } = extractEntities('Am 1.1.2024 startete das Projekt.');
      expect(numbers.filter((n) => n === '1')).toHaveLength(0);
    });

    it('does not count standalone 4-digit years as numbers', () => {
      const { numbers } = extractEntities('Im Jahr 2024 war es anders.');
      expect(numbers).not.toContain('2024');
    });
  });

  describe('dates', () => {
    it('extracts DD.MM.YYYY dates', () => {
      const { dates } = extractEntities('Der Termin ist am 15.03.2024.');
      expect(dates).toContain('15.03.2024');
    });

    it('extracts standalone 4-digit years', () => {
      const { dates } = extractEntities('Im Jahr 2024 war es anders.');
      expect(dates).toContain('2024');
    });

    it('deduplicates dates', () => {
      const { dates } = extractEntities('Am 1.1.2024 und nochmal am 1.1.2024.');
      expect(dates.filter((d) => d === '1.1.2024')).toHaveLength(1);
    });
  });

  describe('names', () => {
    it('extracts multi-word proper names', () => {
      const { names } = extractEntities('Angela Merkel war Bundeskanzlerin.');
      expect(names).toContain('Angela Merkel');
    });

    it('excludes names starting with skip words', () => {
      const { names } = extractEntities('Die Bundesregierung hat entschieden.');
      expect(names).not.toContain('Die Bundesregierung');
    });

    it('does not extract single capitalized words', () => {
      const { names } = extractEntities('Deutschland ist schön.');
      expect(names).toHaveLength(0);
    });
  });

  describe('quotes', () => {
    it('extracts German-style quotes „…"', () => {
      const { quotes } = extractEntities('Er sagte „Hallo Welt" und ging.');
      expect(quotes).toContain('Hallo Welt');
    });

    it('extracts English-style quotes "…"', () => {
      const { quotes } = extractEntities('She said "hello world" and left.');
      expect(quotes).toContain('hello world');
    });

    it('returns empty arrays for text with no entities', () => {
      const result = extractEntities('einfacher text ohne besonderheiten hier.');
      expect(result.numbers).toHaveLength(0);
      expect(result.dates).toHaveLength(0);
      expect(result.names).toHaveLength(0);
      expect(result.quotes).toHaveLength(0);
    });
  });
});
