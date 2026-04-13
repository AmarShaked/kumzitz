import { describe, it, expect } from 'vitest';
import { frequencyToNoteName } from './useChordFinder';

describe('frequencyToNoteName', () => {
  it('maps A4 (440 Hz) to A', () => {
    expect(frequencyToNoteName(440)).toBe('A');
  });

  it('maps E2 (82.41 Hz) to E', () => {
    expect(frequencyToNoteName(82.41)).toBe('E');
  });

  it('maps C4 (261.63 Hz) to C', () => {
    expect(frequencyToNoteName(261.63)).toBe('C');
  });

  it('maps G3 (196 Hz) to G', () => {
    expect(frequencyToNoteName(196)).toBe('G');
  });

  it('maps F#4 (369.99 Hz) to F#', () => {
    expect(frequencyToNoteName(369.99)).toBe('F#');
  });
});
