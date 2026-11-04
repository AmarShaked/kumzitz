// Chord simplification for playing along: song key, "3 chords" (the 1-4-5), and easy shapes
// (guitar: capo so the song keeps its key; piano/ukulele: move to the easiest key).
import { transposeChord, simplifyChord, findEasiestTranspose } from './transpose';

export type Triad = { root: number; q: 'maj' | 'min' };
export type SongKey = { tonic: number; mode: 'major' | 'minor'; name: string };
export type Instrument = 'guitar' | 'ukulele' | 'piano';

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const PC: Record<string, number> = Object.fromEntries([
  ...SHARPS.map((n, i) => [n, i]), ...FLATS.map((n, i) => [n, i]), ['Cb', 11], ['Fb', 4], ['E#', 5], ['B#', 0],
]);

const same = (a: Triad, b: Triad) => a.root === b.root && a.q === b.q;
const pcs = (t: Triad) => [t.root, (t.root + (t.q === 'min' ? 3 : 4)) % 12, (t.root + 7) % 12];

export function toTriad(chord: string): Triad | null {
  const m = simplifyChord(chord).match(/^([A-G][b#]?)(m?)$/);
  if (!m || PC[m[1]] === undefined) return null;
  return { root: PC[m[1]], q: m[2] ? 'min' : 'maj' };
}

function usesFlats(key: SongKey | null): boolean {
  if (!key) return false;
  const majTonic = key.mode === 'major' ? key.tonic : (key.tonic + 3) % 12;
  return [5, 10, 3, 8, 1, 6].includes(majTonic);
}

export function triadName(t: Triad, flats = false): string {
  return (flats ? FLATS : SHARPS)[t.root] + (t.q === 'min' ? 'm' : '');
}

// Diatonic in a key (harmonic-minor V and the major IV in minor are allowed: both are
// everywhere in Israeli and Hasidic songs).
function diatonic(t: Triad, tonic: number, mode: 'major' | 'minor'): boolean {
  const deg = (t.root - tonic + 12) % 12;
  const table: Record<number, Triad['q']> = mode === 'major'
    ? { 0: 'maj', 2: 'min', 4: 'min', 5: 'maj', 7: 'maj', 9: 'min' }
    : { 0: 'min', 3: 'maj', 5: 'min', 7: 'min', 8: 'maj', 10: 'maj' };
  if (mode === 'minor' && t.q === 'maj' && (deg === 7 || deg === 5)) return true;
  return table[deg] === t.q;
}

/** Key of a song from its chord list: diatonic fit, how much the tonic chord is used,
 *  and first/last chord (lightly: many songs end on a half cadence). */
export function detectKey(chords: string[]): SongKey | null {
  const triads = chords.map(toTriad).filter((t): t is Triad => !!t);
  if (!triads.length) return null;
  let best: SongKey | null = null;
  let bestScore = -Infinity;
  for (let tonic = 0; tonic < 12; tonic++) {
    for (const mode of ['major', 'minor'] as const) {
      const tq = mode === 'major' ? 'maj' : 'min';
      const isTonic = (t: Triad) => t.root === tonic && t.q === tq;
      const fit = triads.filter((t) => diatonic(t, tonic, mode)).length / triads.length;
      const share = triads.filter(isTonic).length / triads.length;
      const ends = 0.3 * +isTonic(triads[triads.length - 1]) + 0.25 * +isTonic(triads[0]);
      // tie-break between relative keys (Am F C G is C major's vi-IV-I-V, not A minor):
      // prefer the key whose I, IV and V the song actually plays
      const roots = new Set(triads.map((t) => t.root));
      const coverage = [tonic, (tonic + 5) % 12, (tonic + 7) % 12].filter((r) => roots.has(r)).length / 3;
      const score = fit + share + ends + 0.5 * coverage;
      if (score > bestScore) {
        bestScore = score;
        const k = { tonic, mode, name: '' } as SongKey;
        k.name = triadName({ root: tonic, q: tq }, usesFlats(k));
        best = k;
      }
    }
  }
  return best;
}

/** Closest allowed chord: most shared notes, then same root, then in the key. */
export function nearestOf(t: Triad, allowed: Triad[], key: SongKey | null): Triad {
  const notes = new Set(pcs(t));
  let best = allowed[0] ?? t;
  let bestScore = -1;
  for (const a of allowed) {
    let s = pcs(a).filter((p) => notes.has(p)).length * 10 + (a.root === t.root ? 3 : 0);
    if (key && diatonic(a, key.tonic, key.mode)) s += 1;
    if (s > bestScore) { best = a; bestScore = s; }
  }
  return best;
}

// What each scale degree does, measured in semitones above the tonic:
// 0 = home (I), 1 = lead-in (IV), 2 = tension (V).
const FUNCTION_MAJOR: Record<number, 0 | 1 | 2> = {
  0: 0, 4: 0, 9: 0, 3: 0, // I, iii, vi, bIII
  2: 1, 5: 1, 8: 1, 10: 1, 1: 1, // ii, IV, bVI, bVII, bII
  7: 2, 11: 2, 6: 2, // V, vii°, #iv°
};
const FUNCTION_MINOR: Record<number, 0 | 1 | 2> = {
  0: 0, 3: 0, // i, III
  2: 1, 5: 1, 8: 1, 1: 1, // ii°, iv, VI, bII
  7: 2, 10: 2, 11: 2, // v/V, VII, vii°
};

/** The song's 1-4-5: I, IV, V (minor: i, iv, V). The IV and V keep the song's own
 *  quality when it uses that chord (e.g. a minor v), otherwise the textbook one. */
export function primaryChords(chords: string[], key: SongKey | null): Triad[] {
  const triads = chords.map(toTriad).filter((t): t is Triad => !!t);
  if (!key) {
    // no key: the 3 most used chords
    const counts: { t: Triad; n: number }[] = [];
    for (const t of triads) {
      const e = counts.find((x) => same(x.t, t));
      if (e) e.n++;
      else counts.push({ t, n: 1 });
    }
    return counts.sort((a, b) => b.n - a.n).slice(0, 3).map((x) => x.t);
  }
  const quality = (root: number, fallback: Triad['q']): Triad['q'] => {
    const maj = triads.filter((t) => t.root === root && t.q === 'maj').length;
    const min = triads.filter((t) => t.root === root && t.q === 'min').length;
    return maj === 0 && min === 0 ? fallback : maj >= min ? 'maj' : 'min';
  };
  const minor = key.mode === 'minor';
  const iv = (key.tonic + 5) % 12;
  const v = (key.tonic + 7) % 12;
  return [
    { root: key.tonic, q: minor ? 'min' : 'maj' },
    { root: iv, q: quality(iv, minor ? 'min' : 'maj') },
    { root: v, q: quality(v, 'maj') },
  ];
}

const EXTRA_SHARE = 0.2;

function relativeKey(k: SongKey): SongKey {
  const minor = k.mode === 'major';
  const tonic = (k.tonic + (minor ? 9 : 3)) % 12;
  const r = { tonic, mode: minor ? 'minor' : 'major', name: '' } as SongKey;
  r.name = triadName({ root: tonic, q: minor ? 'min' : 'maj' }, usesFlats(r));
  return r;
}

/** How many of a key's I, IV, V roots the song actually plays (0–3). */
function primariesPlayed(triads: Triad[], k: SongKey): number {
  const roots = new Set(triads.map((t) => t.root));
  return [k.tonic, (k.tonic + 5) % 12, (k.tonic + 7) % 12].filter((r) => roots.has(r)).length;
}

/** Read the song in its key, or in the relative major/minor when the song plays more of
 *  that key's I, IV and V (Am F C G has no Dm or E: it's C major's vi-IV-I-V). */
function bestReduction(chords: string[], key: SongKey | null) {
  const triads = chords.map(toTriad).filter((t): t is Triad => !!t);
  let k = key;
  if (key) {
    const rel = relativeKey(key);
    if (primariesPlayed(triads, rel) > primariesPlayed(triads, key)) k = rel;
  }
  const primary = primaryChords(chords, k);
  return { key: k, primary, extra: leanedOnChord(chords, primary) };
}

/** The one chord outside I-IV-V that a song relies on (e.g. vi in vi-IV-I-V), if any:
 *  the most used non-primary chord, when it is at least 20% of the song's chords. */
export function leanedOnChord(chords: string[], primary: Triad[]): Triad | null {
  const triads = chords.map(toTriad).filter((t): t is Triad => !!t);
  if (!triads.length) return null;
  const counts: { t: Triad; n: number }[] = [];
  for (const t of triads) {
    if (primary.some((p) => same(p, t))) continue;
    const e = counts.find((x) => same(x.t, t));
    if (e) e.n++;
    else counts.push({ t, n: 1 });
  }
  counts.sort((a, b) => b.n - a.n);
  return counts[0] && counts[0].n / triads.length >= EXTRA_SHARE ? counts[0].t : null;
}

/** Fold any chord onto the I, IV or V with the same job (home / lead-in / tension). */
export function toPrimary(t: Triad, primary: Triad[], key: SongKey | null): Triad {
  if (key && primary.length === 3) {
    const deg = (t.root - key.tonic + 12) % 12;
    const fn = (key.mode === 'major' ? FUNCTION_MAJOR : FUNCTION_MINOR)[deg];
    if (fn !== undefined) return primary[fn];
  }
  return nearestOf(t, primary, key);
}

// Guitar shape difficulty: open chords are free, small barres cost 2, other barres 3.
const OPEN = new Set(['C', 'D', 'E', 'G', 'A', 'Am', 'Dm', 'Em', 'B7']);
const shapeOf = (t: Triad) => {
  const n = triadName(t);
  return n === 'B' ? 'B7' : n; // open B7 is the standard easy stand-in for a B barre
};
const shapeCost = (t: Triad) => (OPEN.has(shapeOf(t)) ? 0 : shapeOf(t) === 'F' || shapeOf(t) === 'Bm' ? 2 : 3);
const shift = (t: Triad, n: number): Triad => ({ root: (t.root + n + 120) % 12, q: t.q });

/** Capo fret (0–7) that makes these chords easiest to finger. */
export function capoFor(chords: string[]): number {
  const triads = chords.map(toTriad).filter((t): t is Triad => !!t);
  const unique = triads.filter((t, i) => triads.findIndex((u) => same(u, t)) === i);
  let best = 0;
  let bestCost = Infinity;
  for (let capo = 0; capo <= 7; capo++) {
    const cost = unique.reduce((s, t) => s + shapeCost(shift(t, -capo)), 0) + 0.15 * capo;
    if (cost < bestCost - 1e-9) { best = capo; bestCost = cost; }
  }
  return best;
}

export type MapperOptions = { transpose: number; three: boolean; easy: boolean; instrument: Instrument };
export type ChordMapper = {
  map: (chord: string) => string;
  key: SongKey | null; // key after manual transposition (what it sounds like)
  capo: number; // guitar easy mode
  keyShift: number; // piano/ukulele easy mode: semitones moved to the easy key
  three: string[]; // the song's I, IV, V as shown
  extra: string | null; // a 4th chord kept because the song leans on it (>= 20% of chords)
};

/** One function turning each written chord into what the player should see. */
export function buildChordMapper(chords: string[], o: MapperOptions): ChordMapper {
  const moved = chords.map((c) => transposeChord(c, o.transpose));
  const key = detectKey(moved);
  const flats = usesFlats(key);
  // 1-4-5 reduction: read the song in its key or the relative major/minor (Am F C G is
  // both), keeping whichever reading preserves the most notes of the original chords
  const plan = o.three ? bestReduction(moved, key) : { primary: [] as Triad[], extra: null, key };
  const primary = plan.primary;
  const extra = plan.extra;
  const fnKey = plan.key;

  // step 1: what the chord is (after transpose, and the 1-4-5 reduction / simplification)
  const base = (chord: string): string => {
    if (!o.transpose && !o.three && !o.easy) return chord; // exactly as written
    const c = transposeChord(chord, o.transpose);
    const t = toTriad(c);
    if (o.three && t) return triadName(extra && same(t, extra) ? extra : toPrimary(t, primary, fnKey), flats);
    if (o.easy) return t ? triadName(t, flats) : c;
    return respell(c, flats);
  };
  // step 2: easy shapes. The capo / easy key depends only on the song (and manual
  // transpose), never on the 1·4·5 switch, so turning 1·4·5 on just removes chords
  // instead of changing every shape.
  const songTriads = moved.map((c) => {
    const t = toTriad(c);
    return t ? triadName(t) : c;
  });
  let capo = 0;
  let keyShift = 0;
  if (o.easy && o.instrument === 'guitar') capo = capoFor(songTriads);
  else if (o.easy) keyShift = findEasiestTranspose(songTriads);

  const map = (chord: string): string => {
    const name = base(chord);
    if (!o.easy) return name;
    const t = toTriad(name);
    if (!t) return name;
    if (o.instrument === 'guitar') return shapeOf(shift(t, -capo));
    return triadName(shift(t, keyShift), usesFlats(key && { ...key, tonic: (key.tonic + keyShift) % 12 }));
  };

  return {
    map, key, capo, keyShift,
    three: primary.map((t) => map(triadName(t))),
    extra: extra ? map(triadName(extra)) : null,
  };
}

/** Spell a chord's root with flats (keeps the rest of the name). */
function respell(chord: string, flats: boolean): string {
  const m = chord.match(/^([A-G][b#]?)(.*)$/);
  if (!m || PC[m[1]] === undefined) return chord;
  const bass = m[2].match(/^(.*\/)([A-G][b#]?)$/);
  const root = (flats ? FLATS : SHARPS)[PC[m[1]]];
  if (bass && PC[bass[2]] !== undefined) return root + bass[1] + (flats ? FLATS : SHARPS)[PC[bass[2]]];
  return root + m[2];
}
