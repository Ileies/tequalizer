// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { shouldRewrite } from '../../entrypoints/content/segmentClassifier.ts';
import type { Segment } from '../../entrypoints/content/domSegmenter.ts';

function makeSegment(html: string, tag = 'p'): Segment {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<${tag}>${html}</${tag}>`;
  const element = wrapper.querySelector(tag)!;
  return { element, text: element.textContent?.trim() ?? '', role: 'paragraph', index: 0 };
}

function makeWrapped(innerTag: string, innerHtml: string, outerTag: string): Segment {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<${outerTag}><${innerTag}>${innerHtml}</${innerTag}></${outerTag}>`;
  const element = wrapper.querySelector(innerTag)!;
  return { element, text: element.textContent?.trim() ?? '', role: 'paragraph', index: 0 };
}

const GOOD_PROSE =
  'Die Quantenmechanik beschreibt das Verhalten von Teilchen auf subatomarer Ebene. ' +
  'Sie wurde im frühen 20. Jahrhundert von Physikern wie Niels Bohr und Werner Heisenberg entwickelt. ' +
  'Ihre Prinzipien widersprechen oft der klassischen Vorstellung von Ursache und Wirkung.';

describe('shouldRewrite', () => {
  it('rejects text shorter than 50 chars', () => {
    const seg = makeSegment('Kurzer Text hier.');
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'too_short' });
  });

  it('rejects text with fewer than 10 words (>= 50 chars via long compound word)', () => {
    // "Donaudampfschifffahrtsgesellschaft" fills the char requirement alone;
    // the whole string has only 6 words — passes too_short, fails too_few_words
    const seg = makeSegment(
      'Donaudampfschifffahrtsgesellschaft, ihre Geschichte und Bedeutung insgesamt.'
    );
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'too_few_words' });
  });

  it('rejects purely numeric text (>= 50 chars)', () => {
    // 62 chars, only digits/punctuation/symbols allowed by the regex
    const seg = makeSegment('1.234.567 - 98,6 % + 42 / 7 - 2024 - 100 - 200 - 300 - 400');
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'numeric_only' });
  });

  it('rejects paragraph inside <nav>', () => {
    const seg = makeWrapped('p', GOOD_PROSE, 'nav');
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'chrome_region' });
  });

  it('rejects paragraph inside <footer>', () => {
    const seg = makeWrapped('p', GOOD_PROSE, 'footer');
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'chrome_region' });
  });

  it('rejects paragraph inside <code>', () => {
    const seg = makeWrapped('p', GOOD_PROSE, 'code');
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'code' });
  });

  it('rejects paragraph inside <table>', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<table><tbody><tr><td><p>${GOOD_PROSE}</p></td></tr></tbody></table>`;
    const element = wrapper.querySelector('p')!;
    const seg: Segment = {
      element,
      text: element.textContent?.trim() ?? '',
      role: 'paragraph',
      index: 0,
    };
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'tabular' });
  });

  it('rejects heading elements', () => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<h2>${GOOD_PROSE}</h2>`;
    const element = wrapper.querySelector('h2')!;
    const seg: Segment = {
      element,
      text: element.textContent?.trim() ?? '',
      role: 'heading',
      index: 0,
    };
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'heading' });
  });

  it('rejects link-dense text (link chars > 30% of total)', () => {
    // Link text is ~60% of the total text; >= 10 words throughout
    const wrapper = document.createElement('div');
    wrapper.innerHTML =
      '<p>Weitere Infos unter ' +
      '<a href="#">dieser ausführlichen Seite mit detaillierten Erklärungen zu allen wichtigen Themen und häufig gestellten Fragen</a>' +
      ' und dort noch mehr.</p>';
    const element = wrapper.querySelector('p')!;
    const seg: Segment = {
      element,
      text: element.textContent?.trim() ?? '',
      role: 'paragraph',
      index: 0,
    };
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'link_dense' });
  });

  it('rejects boilerplate text', () => {
    const seg = makeSegment(
      '© 2024 Beispiel GmbH. All rights reserved. Alle Rechte vorbehalten. ' +
        'Nutzung dieser Seite unterliegt unserer Privacy Policy und Cookie-Richtlinie.'
    );
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'boilerplate' });
  });

  it('rejects text with low content score (no sentence-ending punctuation)', () => {
    // >= 50 chars, >= 10 words, not numeric, not in special region, not heading, not link-dense,
    // but no period/!/? → sentenceCount = 0 → score = 0 < CONTENT_THRESHOLD
    const seg = makeSegment(
      'Willkommen auf unserer Webseite mit vielen tollen Angeboten und Neuigkeiten aus aller Welt'
    );
    expect(shouldRewrite(seg)).toEqual({ rewrite: false, reason: 'low_content_score' });
  });

  it('approves good prose paragraph', () => {
    const seg = makeSegment(GOOD_PROSE);
    expect(shouldRewrite(seg)).toEqual({ rewrite: true, reason: 'content_segment' });
  });
});
