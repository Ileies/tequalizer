import { describe, it, expect } from 'vitest';
import { checkFidelity } from '../../src/fidelity/checker.ts';
import { extractEntities } from '../../src/fidelity/entityExtractor.ts';

describe('extractEntities', () => {
  it('extracts plain numbers', () => {
    const { numbers } = extractEntities('Der Anteil beträgt 42% und 3,14 ist Pi.');
    expect(numbers).toContain('42%');
    expect(numbers).toContain('3,14');
  });

  it('extracts numbers with space before unit (already normalized by extractor)', () => {
    const { numbers } = extractEntities('Er kostete 100 € und 98,6 % waren positiv.');
    expect(numbers).toContain('100€');
    expect(numbers).toContain('98,6%');
  });

  it('extracts German-style quoted text', () => {
    const { quotes } = extractEntities('Er sagte: „Das ist falsch."');
    expect(quotes).toContain('Das ist falsch.');
  });

  it('extracts English-style quoted text', () => {
    const { quotes } = extractEntities('She said: "This is wrong."');
    expect(quotes).toContain('This is wrong.');
  });

  it('extracts multi-word proper names', () => {
    const { names } = extractEntities('Angela Merkel war Bundeskanzlerin.');
    expect(names).toContain('Angela Merkel');
  });

  it('does not extract articles as part of a name', () => {
    const { names } = extractEntities('Die Bundeskanzlerin trat zurück.');
    // "Die Bundeskanzlerin" should be skipped — "Die" is in SKIP_FIRST_WORDS
    expect(names).not.toContain('Die Bundeskanzlerin');
  });

  it('extracts dates', () => {
    const { dates } = extractEntities('Am 1.5.2024 fand das Ereignis statt.');
    expect(dates).toContain('1.5.2024');
  });

  it('extracts standalone years', () => {
    const { dates } = extractEntities('Das war im Jahr 2019 der Fall.');
    expect(dates).toContain('2019');
  });
});

describe('checkFidelity', () => {
  it('flags invented number as high severity', () => {
    const original = 'Der Anteil beträgt 42%.';
    const rewritten = 'Der Anteil liegt bei 43%.';
    const report = checkFidelity(original, rewritten);
    expect(report.passed).toBe(false);
    const issue = report.issues.find((i) => i.type === 'invented_numbers');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('high');
    expect(issue?.detail).toContain('43%');
  });

  it('flags dropped verbatim quote as high severity', () => {
    const original = 'Er sagte: „Wir kommen morgen zurück."';
    const rewritten = 'Er teilte mit, dass sie zurückkommen würden.';
    const report = checkFidelity(original, rewritten);
    expect(report.passed).toBe(false);
    const issue = report.issues.find((i) => i.type === 'dropped_quotes');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('high');
  });

  it('flags invented proper name as medium severity', () => {
    const original = 'Angela Merkel war Bundeskanzlerin.';
    const rewritten = 'Angela Merkel und Friedrich Merz waren bekannte Politiker.';
    const report = checkFidelity(original, rewritten);
    const issue = report.issues.find((i) => i.type === 'invented_names');
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe('medium');
    expect(issue?.detail).toContain('Friedrich Merz');
  });

  it('flags dropped number as medium severity', () => {
    const original = 'Die Wachstumsrate lag bei 5,2%.';
    const rewritten = 'Die Wachstumsrate war bemerkenswert.';
    const report = checkFidelity(original, rewritten);
    const droppedIssue = report.issues.find((i) => i.type === 'dropped_numbers');
    expect(droppedIssue).toBeDefined();
    expect(droppedIssue?.severity).toBe('medium');
    // Only medium severity — should still pass (no high issues)
    expect(report.passed).toBe(true);
  });

  it('passes for faithful rewrite without new entities', () => {
    const original =
      'Die Quantenmechanik wurde im frühen 20. Jahrhundert entwickelt. ' +
      'Sie beschreibt das Verhalten von Teilchen auf subatomarer Ebene.';
    const rewritten =
      'Die Quantenmechanik entstand im frühen 20. Jahrhundert. ' +
      'Ihr Fokus liegt auf dem Verhalten subatomarer Teilchen.';
    const report = checkFidelity(original, rewritten);
    expect(report.passed).toBe(true);
    const highIssues = report.issues.filter((i) => i.severity === 'high');
    expect(highIssues).toHaveLength(0);
  });

  it('normalizes number format variants (42% == 42 %)', () => {
    const original = 'Der Anteil beträgt 42%.';
    const rewritten = 'Der Anteil liegt bei 42 %.';
    const report = checkFidelity(original, rewritten);
    // Same number, different formatting — should not flag invented_numbers
    const inventedIssue = report.issues.find((i) => i.type === 'invented_numbers');
    expect(inventedIssue).toBeUndefined();
  });
});
