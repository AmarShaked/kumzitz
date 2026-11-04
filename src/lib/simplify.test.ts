import { describe, it, expect } from 'vitest';
import { detectKey, primaryChords, toPrimary, buildChordMapper, toTriad, capoFor } from './simplify';

// A typical Israeli minor-key progression, written the way tab4u writes it
const MINOR_SONG = ['Dm', 'Am', 'Dm', 'Am', 'Dm', 'F', 'Am', 'Gm', 'F', 'Dm', 'Bb', 'Am', 'Dm', 'A7', 'Dm'];

describe('toTriad', () => {
  it('reduces extensions, slashes and flats', () => {
    expect(toTriad('Am7')).toEqual({ root: 9, q: 'min' });
    expect(toTriad('C/E')).toEqual({ root: 0, q: 'maj' });
    expect(toTriad('Bbmaj7')).toEqual({ root: 10, q: 'maj' });
    expect(toTriad('xyz')).toBeNull();
  });
});

describe('detectKey', () => {
  it('finds a minor key even when the song ends on the dominant', () => {
    expect(detectKey([...MINOR_SONG, 'Am'])?.name).toBe('Dm');
  });
  it('finds a major key', () => {
    expect(detectKey(['G', 'D', 'Em', 'C', 'G', 'D', 'C', 'G'])?.name).toBe('G');
  });
  it('returns null for no chords', () => {
    expect(detectKey([])).toBeNull();
  });
});

describe('primaryChords (1-4-5)', () => {
  it('major key: I, IV, V', () => {
    const key = detectKey(['C', 'Am', 'F', 'G', 'C'])!;
    expect(primaryChords(['C', 'Am', 'F', 'G', 'C'], key)).toEqual([
      { root: 0, q: 'maj' }, { root: 5, q: 'maj' }, { root: 7, q: 'maj' },
    ]);
  });
  it('minor key: i, iv, V (major V by default)', () => {
    const song = ['Am', 'Dm', 'E', 'Am', 'F', 'G', 'Am'];
    expect(primaryChords(song, detectKey(song)!)).toEqual([
      { root: 9, q: 'min' }, { root: 2, q: 'min' }, { root: 4, q: 'maj' },
    ]);
  });
  it('keeps the song\'s own minor v when it uses one', () => {
    const p = primaryChords(MINOR_SONG, detectKey(MINOR_SONG)!);
    expect(p).toEqual([{ root: 2, q: 'min' }, { root: 7, q: 'min' }, { root: 9, q: 'min' }]); // Dm Gm Am
  });
});

describe('toPrimary (chord function)', () => {
  const C = detectKey(['C', 'F', 'G', 'C'])!;
  const prim = primaryChords(['C', 'F', 'G', 'C'], C);
  const name = (c: string) => {
    const t = toPrimary(toTriad(c)!, prim, C);
    return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][t.root] + (t.q === 'min' ? 'm' : '');
  };
  it('tonic family → I', () => { expect(name('Am')).toBe('C'); expect(name('Em')).toBe('C'); });
  it('subdominant family → IV', () => { expect(name('Dm')).toBe('F'); expect(name('Bb')).toBe('F'); expect(name('Ab')).toBe('F'); });
  it('dominant family → V', () => { expect(name('G7')).toBe('G'); expect(name('Bdim')).toBe('G'); });
  it('chords outside the scale go to the closest of the three (shared notes)', () => {
    // E major in C major (degree 4, but major): shares E and B... closest is G (B) or C (E): never crashes
    const t = toPrimary(toTriad('E')!, prim, C);
    expect(prim).toContainEqual(t);
    const k = detectKey(['Am', 'Dm', 'E', 'Am'])!;
    const p = primaryChords(['Am', 'Dm', 'E', 'Am'], k);
    expect(p).toContainEqual(toPrimary(toTriad('F#')!, p, k)); // degree 9 in minor: not in the table
  });
  it('minor key: III → i, VI → iv, VII → V', () => {
    const song = ['Am', 'Dm', 'E', 'Am'];
    const k = detectKey(song)!;
    const p = primaryChords(song, k);
    const nm = (c: string) => { const t = toPrimary(toTriad(c)!, p, k); return `${t.root}${t.q}`; };
    expect(nm('C')).toBe('9min'); // C → Am
    expect(nm('F')).toBe('2min'); // F → Dm
    expect(nm('G')).toBe('4maj'); // G → E
  });
});

describe('capoFor', () => {
  it('chooses open shapes over barre chords', () => {
    // Dm Am F Gm → capo 5 gives Am Em C Dm (all open)
    expect(capoFor(['Dm', 'Am', 'F', 'Gm'])).toBe(5);
  });
  it('keeps no capo when the chords are already easy', () => {
    expect(capoFor(['G', 'D', 'Em', 'C'])).toBe(0);
  });
});

describe('buildChordMapper', () => {
  it('passes chords through untouched by default', () => {
    const m = buildChordMapper(MINOR_SONG, { transpose: 0, three: false, easy: false, instrument: 'guitar' });
    expect(m.map('Bb')).toBe('Bb');
    expect(m.map('A7')).toBe('A7');
  });

  it('3-chords mode reduces the song to its I, IV, V', () => {
    const m = buildChordMapper(MINOR_SONG, { transpose: 0, three: true, easy: false, instrument: 'guitar' });
    expect(new Set(MINOR_SONG.map(m.map))).toEqual(new Set(['Dm', 'Gm', 'Am']));
    expect(m.map('F')).toBe('Dm'); // III → i
    expect(m.map('Bb')).toBe('Gm'); // VI → iv
    expect(m.map('A7')).toBe('Am'); // V7 → the song's own v
    expect(m.three).toEqual(['Dm', 'Gm', 'Am']);
  });

  it('easy guitar mode keeps the key and shows capo shapes', () => {
    const m = buildChordMapper(MINOR_SONG, { transpose: 0, three: true, easy: true, instrument: 'guitar' });
    expect(m.capo).toBe(5);
    expect(m.three).toEqual(['Am', 'Dm', 'Em']); // all open shapes
  });

  it('easy piano mode moves to an easy key instead (no capo on piano)', () => {
    const m = buildChordMapper(MINOR_SONG, { transpose: 0, three: true, easy: true, instrument: 'piano' });
    expect(m.capo).toBe(0);
    expect(m.keyShift).not.toBe(0);
    expect(m.map('Dm')).toMatch(/^[A-G]/);
  });

  it('applies manual transposition first', () => {
    const m = buildChordMapper(['C', 'G'], { transpose: 2, three: false, easy: false, instrument: 'guitar' });
    expect(m.map('C')).toBe('D');
  });
});
