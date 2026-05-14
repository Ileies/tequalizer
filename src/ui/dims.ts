import type { StyleConfig } from '../storage/schema.ts';

export const DIMS: Array<{
  key: keyof StyleConfig['dimensions'];
  label: string;
  min: string;
  max: string;
}> = [
  { key: 'length', label: 'Länge', min: 'Kürzer', max: 'Länger' },
  { key: 'imagery', label: 'Bildlichkeit', min: 'Sachlich', max: 'Bildhaft' },
  { key: 'warmth', label: 'Wärme', min: 'Kalt', max: 'Warm' },
  { key: 'formality', label: 'Formalität', min: 'Locker', max: 'Förmlich' },
  { key: 'simplicity', label: 'Einfachheit', min: 'Komplex', max: 'Einfach' },
];
