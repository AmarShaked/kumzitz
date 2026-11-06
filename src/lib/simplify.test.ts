import { describe, it, expect } from 'vitest';
import { detectKey, primaryChords, toPrimary, buildChordMapper, toTriad, capoFor, parseKey, KEY_NAMES } from './simplify';

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
  it('prefers the key whose I, IV and V the song actually uses (pop loop vi-IV-I-V)', () => {
    expect(detectKey('Am F C G Am F C G'.split(' '))?.name).toBe('C');
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

  it('keeps a 4th chord the song leans on (>= 20% of its chords)', () => {
    const pop = 'Am F C G Am F C G C G Am F'.split(' ');
    const m = buildChordMapper(pop, { transpose: 0, three: true, easy: false, instrument: 'guitar' });
    expect(pop.map(m.map)).toEqual(pop); // vi-IV-I-V stays exactly as written
    expect(m.three).toEqual(['C', 'F', 'G']);
    expect(m.extra).toBe('Am');
  });

  it('does not keep a 4th chord that is only used now and then', () => {
    const m = buildChordMapper(MINOR_SONG, { transpose: 0, three: true, easy: false, instrument: 'guitar' });
    expect(m.extra).toBeNull(); // F and Bb are each well under 20% of Hashivenu-like song
    expect(new Set(MINOR_SONG.map(m.map)).size).toBe(3);
  });

  it('the kept 4th chord also gets easy shapes', () => {
    const pop = 'Bm G D A Bm G D A'.split(' '); // D major: vi-IV-I-V
    const m = buildChordMapper(pop, { transpose: 0, three: true, easy: true, instrument: 'guitar' });
    expect(m.extra).not.toBeNull();
    expect(new Set(pop.map(m.map)).size).toBe(4);
  });

  it('turning 1·4·5 on keeps the same capo and shapes (it only removes chords)', () => {
    // Zusha-like song in Db: easy alone gives capo 1 (C F G Em Am)
    const song = 'Db Gb Db Ab4 Fm Gb Bbm7 Gbmaj7 Ab Fm7 Bbm Db/F Db Gb Ab Bbm Fm Gb Db Ab'.split(' ');
    for (const instrument of ['guitar', 'piano'] as const) {
      const easy = buildChordMapper(song, { transpose: 0, three: false, easy: true, instrument });
      const both = buildChordMapper(song, { transpose: 0, three: true, easy: true, instrument });
      expect(both.capo).toBe(easy.capo);
      expect(both.keyShift).toBe(easy.keyShift);
      const easyShapes = new Set(song.map(easy.map));
      for (const c of new Set(song.map(both.map))) expect(easyShapes).toContain(c);
    }
  });

  it('ukulele gets a capo with easy ukulele shapes and keeps the key', () => {
    const song = 'Db Gb Ab Bbm Db Gb Ab Db'.split(' ');
    const m = buildChordMapper(song, { transpose: 0, three: false, easy: true, instrument: 'ukulele' });
    expect(m.keyShift).toBe(0);
    expect(m.capo).toBeGreaterThan(0);
    const easyUke = new Set(['C', 'Am', 'F', 'G', 'Dm', 'A', 'D', 'Em', 'Gm', 'A7', 'C7', 'D7', 'E7', 'G7']);
    for (const c of new Set(song.map(m.map))) expect(easyUke).toContain(c);
  });

  it('piano moves to an easy key and says which key', () => {
    const song = 'Db Gb Ab Bbm Db Gb Ab Db'.split(' ');
    const m = buildChordMapper(song, { transpose: 0, three: false, easy: true, instrument: 'piano' });
    expect(m.capo).toBe(0);
    expect(m.keyShift).not.toBe(0);
    expect(m.easyKey).toBe(m.map('Db')); // the new home chord is the new key
  });
});

describe('selected key', () => {
  it('parses key names in any spelling', () => {
    expect(parseKey('Dm')).toMatchObject({ tonic: 2, mode: 'minor' });
    expect(parseKey('Db')).toMatchObject({ tonic: 1, mode: 'major' });
    expect(parseKey('C#')).toMatchObject({ tonic: 1, mode: 'major' });
    expect(parseKey('Bbm')).toMatchObject({ tonic: 10, mode: 'minor' });
    expect(parseKey('')).toBeNull();
    expect(parseKey('xyz')).toBeNull();
  });

  it('offers all 24 keys', () => {
    expect(KEY_NAMES).toHaveLength(24);
    for (const k of KEY_NAMES) expect(parseKey(k)).not.toBeNull();
  });

  it('1·4·5 works in the selected key, not a re-detected one', () => {
    const loop = 'Am F C G Am F C G'.split(' ');
    const inC = buildChordMapper(loop, { transpose: 0, three: true, easy: false, instrument: 'guitar', songKey: 'C' });
    expect(inC.key?.name).toBe('C');
    expect(inC.three).toEqual(['C', 'F', 'G']);
    const inAm = buildChordMapper(loop, { transpose: 0, three: true, easy: false, instrument: 'guitar', songKey: 'Am' });
    expect(inAm.key?.name).toBe('Am');
    expect(inAm.three).toEqual(['Am', 'Dm', 'E']); // the chosen key's i, iv, V
  });

  it('the selected key follows manual transposition', () => {
    const m = buildChordMapper(MINOR_SONG, { transpose: 2, three: true, easy: false, instrument: 'guitar', songKey: 'Dm' });
    expect(m.key?.name).toBe('Em');
    expect(m.three).toEqual(['Em', 'Am', 'Bm']);
  });

  it('chords already in the selected key\'s I, IV, V are never changed', () => {
    const m = buildChordMapper(MINOR_SONG, { transpose: 0, three: true, easy: false, instrument: 'guitar', songKey: 'Dm' });
    for (const c of ['Dm', 'Gm', 'Am']) expect(m.map(c)).toBe(c);
  });
});

