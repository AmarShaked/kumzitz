import { describe, it, expect } from 'vitest';
import { parseLine, parseChordPro, serializeLine, serializeChordPro, parseDirectives } from './chordpro';

describe('parseLine', () => {
  it('parses a line with chords', () => {
    expect(parseLine('[G]שלום [D]עולם')).toEqual([
      { chord: 'G', text: 'שלום ' },
      { chord: 'D', text: 'עולם' },
    ]);
  });

  it('parses a line with no chords', () => {
    expect(parseLine('שורה בלי אקורדים')).toEqual([
      { chord: null, text: 'שורה בלי אקורדים' },
    ]);
  });

  it('parses a chord at end of line with no trailing text', () => {
    expect(parseLine('טקסט [Am]')).toEqual([
      { chord: null, text: 'טקסט ' },
      { chord: 'Am', text: '' },
    ]);
  });

  it('parses complex chord names', () => {
    expect(parseLine('[C#m7]שלום [Bbmaj7]עולם')).toEqual([
      { chord: 'C#m7', text: 'שלום ' },
      { chord: 'Bbmaj7', text: 'עולם' },
    ]);
  });

  it('parses an empty line', () => {
    expect(parseLine('')).toEqual([]);
  });
});

describe('parseChordPro', () => {
  it('parses multiline content', () => {
    const content = '[G]שורה ראשונה\n[Am]שורה שנייה';
    const result = parseChordPro(content);
    expect(result).toHaveLength(2);
    expect(result[0].segments).toEqual([{ chord: 'G', text: 'שורה ראשונה' }]);
    expect(result[1].segments).toEqual([{ chord: 'Am', text: 'שורה שנייה' }]);
  });

  it('preserves empty lines as section breaks', () => {
    const content = '[G]שורה\n\n[Am]שורה';
    const result = parseChordPro(content);
    expect(result).toHaveLength(3);
    expect(result[1].segments).toEqual([]);
  });
});

describe('serializeLine', () => {
  it('serializes segments back to ChordPro', () => {
    const segments = [
      { chord: 'G', text: 'שלום ' },
      { chord: 'D', text: 'עולם' },
    ];
    expect(serializeLine(segments)).toBe('[G]שלום [D]עולם');
  });

  it('serializes text-only segments', () => {
    const segments = [{ chord: null, text: 'טקסט' }];
    expect(serializeLine(segments)).toBe('טקסט');
  });
});

describe('serializeChordPro', () => {
  it('round-trips parse then serialize', () => {
    const original = '[G]שלום [D]עולם\n\n[Am]שורה שנייה';
    const parsed = parseChordPro(original);
    expect(serializeChordPro(parsed)).toBe(original);
  });
});

describe('parseDirectives', () => {
  it('extracts title, artist, and key directives', () => {
    const content = '{title: שיר טוב}\n{artist: זמר}\n{key: G}\n[G]שלום';
    const result = parseDirectives(content);
    expect(result.directives).toEqual({ title: 'שיר טוב', artist: 'זמר', key: 'G' });
    expect(result.content).toBe('[G]שלום');
  });

  it('returns empty directives when none present', () => {
    const result = parseDirectives('[G]שלום');
    expect(result.directives).toEqual({});
    expect(result.content).toBe('[G]שלום');
  });
});
