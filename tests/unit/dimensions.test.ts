import { describe, it, expect } from 'vitest';
import { dimensionToFragment, DIMENSION_FRAGMENTS } from '../../src/style-engine/dimensions.ts';

describe('dimensionToFragment', () => {
  it('returns "-2" fragment for value -2', () => {
    expect(dimensionToFragment('length', -2)).toBe(DIMENSION_FRAGMENTS.length['-2']);
  });

  it('returns "-1" fragment for value -1', () => {
    expect(dimensionToFragment('length', -1)).toBe(DIMENSION_FRAGMENTS.length['-1']);
  });

  it('returns "0" fragment for value 0', () => {
    expect(dimensionToFragment('length', 0)).toBe(DIMENSION_FRAGMENTS.length['0']);
  });

  it('maps all five dimensions at extremes and center', () => {
    const dims = ['length', 'imagery', 'warmth', 'formality', 'simplicity'] as const;
    for (const dim of dims) {
      expect(dimensionToFragment(dim, -2)).toBe(DIMENSION_FRAGMENTS[dim]['-2']);
      expect(dimensionToFragment(dim, 0)).toBe(DIMENSION_FRAGMENTS[dim]['0']);
      expect(dimensionToFragment(dim, 2)).toBe(DIMENSION_FRAGMENTS[dim]['2']);
    }
  });
});
