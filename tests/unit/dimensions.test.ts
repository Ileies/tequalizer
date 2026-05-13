import { describe, it, expect } from 'vitest';
import { dimensionToFragment, DIMENSION_FRAGMENTS } from '../../src/style-engine/dimensions.ts';

describe('dimensionToFragment', () => {
  it('returns "-1" fragment for values below -0.33', () => {
    expect(dimensionToFragment('length', -1)).toBe(DIMENSION_FRAGMENTS.length['-1']);
    expect(dimensionToFragment('length', -0.34)).toBe(DIMENSION_FRAGMENTS.length['-1']);
  });

  it('returns "0" fragment for values in [-0.33, 0.33]', () => {
    expect(dimensionToFragment('length', 0)).toBe(DIMENSION_FRAGMENTS.length['0']);
    expect(dimensionToFragment('length', -0.33)).toBe(DIMENSION_FRAGMENTS.length['0']);
    expect(dimensionToFragment('length', 0.33)).toBe(DIMENSION_FRAGMENTS.length['0']);
  });

  it('returns "+1" fragment for values above 0.33', () => {
    expect(dimensionToFragment('length', 1)).toBe(DIMENSION_FRAGMENTS.length['+1']);
    expect(dimensionToFragment('length', 0.34)).toBe(DIMENSION_FRAGMENTS.length['+1']);
  });

  it('maps all four dimensions', () => {
    const dims = ['length', 'imagery', 'warmth', 'formality'] as const;
    for (const dim of dims) {
      expect(dimensionToFragment(dim, -1)).toBe(DIMENSION_FRAGMENTS[dim]['-1']);
      expect(dimensionToFragment(dim, 0)).toBe(DIMENSION_FRAGMENTS[dim]['0']);
      expect(dimensionToFragment(dim, 1)).toBe(DIMENSION_FRAGMENTS[dim]['+1']);
    }
  });
});
