import { describe, it, expect } from 'vitest';
import { transposeChord, transposeSegments } from './transpose';

describe('transposeChord', () => {
  it('transposes a major chord up', () => {
    expect(transposeChord('G', 2)).toBe('A');
  });
  it('transposes a minor chord up', () => {
    expect(transposeChord('Am', 3)).toBe('Cm');
  });
  it('transposes with sharp', () => {
    expect(transposeChord('C#', 2)).toBe('D#');
  });
  it('wraps around chromatic scale', () => {
    expect(transposeChord('B', 1)).toBe('C');
  });
  it('transposes down (negative semitones)', () => {
    expect(transposeChord('D', -2)).toBe('C');
  });
  it('preserves 7th suffix', () => {
    expect(transposeChord('G7', 2)).toBe('A7');
  });
  it('preserves maj7 suffix', () => {
    expect(transposeChord('Cmaj7', 4)).toBe('Emaj7');
  });
  it('preserves min7 suffix', () => {
    expect(transposeChord('Am7', 2)).toBe('Bm7');
  });
  it('normalizes flat to sharp', () => {
    expect(transposeChord('Bb', 1)).toBe('B');
  });
  it('handles Bb with suffix', () => {
    expect(transposeChord('Bbm', 2)).toBe('Cm');
  });
  it('transposes by 0 returns same chord', () => {
    expect(transposeChord('Em', 0)).toBe('Em');
  });
  it('transposes full octave returns same chord', () => {
    expect(transposeChord('G', 12)).toBe('G');
  });
});

describe('transposeSegments', () => {
  it('transposes all chords in segments', () => {
    const segments = [
      { chord: 'G', text: 'שלום ' },
      { chord: 'D', text: 'עולם' },
    ];
    const result = transposeSegments(segments, 2);
    expect(result).toEqual([
      { chord: 'A', text: 'שלום ' },
      { chord: 'E', text: 'עולם' },
    ]);
  });
  it('skips null chords', () => {
    const segments = [
      { chord: null, text: 'טקסט' },
      { chord: 'Am', text: 'עוד' },
    ];
    const result = transposeSegments(segments, 1);
    expect(result).toEqual([
      { chord: null, text: 'טקסט' },
      { chord: 'A#m', text: 'עוד' },
    ]);
  });
});
