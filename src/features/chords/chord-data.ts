type ChordDef = {
  fingers: [number, number, number, number, number, number];
  barres?: { fromString: number; toString: number; fret: number }[];
  position?: number;
};

const chordDefinitions: Record<string, ChordDef> = {
  // ── Major ──
  'C':    { fingers: [-1, 3, 2, 0, 1, 0] },
  'C#':   { fingers: [-1, 4, 6, 6, 6, 4], barres: [{ fromString: 5, toString: 1, fret: 4 }], position: 4 },
  'Db':   { fingers: [-1, 4, 6, 6, 6, 4], barres: [{ fromString: 5, toString: 1, fret: 4 }], position: 4 },
  'D':    { fingers: [-1, -1, 0, 2, 3, 2] },
  'D#':   { fingers: [-1, 6, 8, 8, 8, 6], barres: [{ fromString: 5, toString: 1, fret: 6 }], position: 6 },
  'Eb':   { fingers: [-1, 6, 8, 8, 8, 6], barres: [{ fromString: 5, toString: 1, fret: 6 }], position: 6 },
  'E':    { fingers: [0, 2, 2, 1, 0, 0] },
  'F':    { fingers: [1, 3, 3, 2, 1, 1], barres: [{ fromString: 6, toString: 1, fret: 1 }] },
  'F#':   { fingers: [2, 4, 4, 3, 2, 2], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },
  'Gb':   { fingers: [2, 4, 4, 3, 2, 2], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },
  'G':    { fingers: [3, 2, 0, 0, 0, 3] },
  'G#':   { fingers: [4, 6, 6, 5, 4, 4], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },
  'Ab':   { fingers: [4, 6, 6, 5, 4, 4], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },
  'A':    { fingers: [-1, 0, 2, 2, 2, 0] },
  'A#':   { fingers: [-1, 1, 3, 3, 3, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'Bb':   { fingers: [-1, 1, 3, 3, 3, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'B':    { fingers: [-1, 2, 4, 4, 4, 2], barres: [{ fromString: 5, toString: 1, fret: 2 }], position: 2 },

  // ── Minor ──
  'Am':   { fingers: [-1, 0, 2, 2, 1, 0] },
  'A#m':  { fingers: [-1, 1, 3, 3, 2, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'Bbm':  { fingers: [-1, 1, 3, 3, 2, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'Bm':   { fingers: [-1, 2, 4, 4, 3, 2], barres: [{ fromString: 5, toString: 1, fret: 2 }], position: 2 },
  'Cm':   { fingers: [-1, 3, 5, 5, 4, 3], barres: [{ fromString: 5, toString: 1, fret: 3 }], position: 3 },
  'C#m':  { fingers: [-1, 4, 6, 6, 5, 4], barres: [{ fromString: 5, toString: 1, fret: 4 }], position: 4 },
  'Dbm':  { fingers: [-1, 4, 6, 6, 5, 4], barres: [{ fromString: 5, toString: 1, fret: 4 }], position: 4 },
  'Dm':   { fingers: [-1, -1, 0, 2, 3, 1] },
  'D#m':  { fingers: [-1, 6, 8, 8, 7, 6], barres: [{ fromString: 5, toString: 1, fret: 6 }], position: 6 },
  'Ebm':  { fingers: [-1, 6, 8, 8, 7, 6], barres: [{ fromString: 5, toString: 1, fret: 6 }], position: 6 },
  'Em':   { fingers: [0, 2, 2, 0, 0, 0] },
  'Fm':   { fingers: [1, 3, 3, 1, 1, 1], barres: [{ fromString: 6, toString: 1, fret: 1 }] },
  'F#m':  { fingers: [2, 4, 4, 2, 2, 2], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },
  'Gbm':  { fingers: [2, 4, 4, 2, 2, 2], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },
  'Gm':   { fingers: [3, 5, 5, 3, 3, 3], barres: [{ fromString: 6, toString: 1, fret: 3 }], position: 3 },
  'G#m':  { fingers: [4, 6, 6, 4, 4, 4], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },
  'Abm':  { fingers: [4, 6, 6, 4, 4, 4], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },

  // ── 7th ──
  'A7':   { fingers: [-1, 0, 2, 0, 2, 0] },
  'A#7':  { fingers: [-1, 1, 3, 1, 3, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'Bb7':  { fingers: [-1, 1, 3, 1, 3, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'B7':   { fingers: [-1, 2, 1, 2, 0, 2] },
  'C7':   { fingers: [-1, 3, 2, 3, 1, 0] },
  'C#7':  { fingers: [-1, 4, 3, 4, 2, -1], position: 1 },
  'Db7':  { fingers: [-1, 4, 3, 4, 2, -1], position: 1 },
  'D7':   { fingers: [-1, -1, 0, 2, 1, 2] },
  'D#7':  { fingers: [-1, -1, 1, 3, 2, 3], position: 1 },
  'Eb7':  { fingers: [-1, -1, 1, 3, 2, 3], position: 1 },
  'E7':   { fingers: [0, 2, 0, 1, 0, 0] },
  'F7':   { fingers: [1, 3, 1, 2, 1, 1], barres: [{ fromString: 6, toString: 1, fret: 1 }] },
  'F#7':  { fingers: [2, 4, 2, 3, 2, 2], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },
  'Gb7':  { fingers: [2, 4, 2, 3, 2, 2], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },
  'G7':   { fingers: [3, 2, 0, 0, 0, 1] },
  'G#7':  { fingers: [4, 6, 4, 5, 4, 4], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },
  'Ab7':  { fingers: [4, 6, 4, 5, 4, 4], barres: [{ fromString: 6, toString: 1, fret: 4 }], position: 4 },

  // ── Minor 7th ──
  'Am7':  { fingers: [-1, 0, 2, 0, 1, 0] },
  'Bm7':  { fingers: [-1, 2, 0, 2, 3, 2] },
  'Bbm7': { fingers: [-1, 1, 3, 1, 2, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'Cm7':  { fingers: [-1, 3, 5, 3, 4, 3], barres: [{ fromString: 5, toString: 1, fret: 3 }], position: 3 },
  'Dm7':  { fingers: [-1, -1, 0, 2, 1, 1] },
  'Em7':  { fingers: [0, 2, 0, 0, 0, 0] },
  'Fm7':  { fingers: [1, 3, 1, 1, 1, 1], barres: [{ fromString: 6, toString: 1, fret: 1 }] },
  'F#m7': { fingers: [2, 4, 2, 2, 2, 2], barres: [{ fromString: 6, toString: 1, fret: 2 }], position: 2 },
  'Gm7':  { fingers: [3, 5, 3, 3, 3, 3], barres: [{ fromString: 6, toString: 1, fret: 3 }], position: 3 },

  // ── Major 7th ──
  'Amaj7':  { fingers: [-1, 0, 2, 1, 2, 0] },
  'Bbmaj7': { fingers: [-1, 1, 3, 2, 3, 1], barres: [{ fromString: 5, toString: 1, fret: 1 }] },
  'Cmaj7':  { fingers: [-1, 3, 2, 0, 0, 0] },
  'Dmaj7':  { fingers: [-1, -1, 0, 2, 2, 2] },
  'Emaj7':  { fingers: [0, 2, 1, 1, 0, 0] },
  'Fmaj7':  { fingers: [-1, -1, 3, 2, 1, 0] },
  'Gmaj7':  { fingers: [3, 2, 0, 0, 0, 2] },

  // ── Suspended ──
  'Asus2': { fingers: [-1, 0, 2, 2, 0, 0] },
  'Asus4': { fingers: [-1, 0, 2, 2, 3, 0] },
  'Dsus2': { fingers: [-1, -1, 0, 2, 3, 0] },
  'Dsus4': { fingers: [-1, -1, 0, 2, 3, 3] },
  'Esus2': { fingers: [0, 2, 4, 4, 0, 0], position: 1 },
  'Esus4': { fingers: [0, 2, 2, 2, 0, 0] },
  'Gsus2': { fingers: [3, 0, 0, 0, 3, 3] },
  'Gsus4': { fingers: [3, 5, 5, 5, 3, 3], barres: [{ fromString: 6, toString: 1, fret: 3 }], position: 3 },
  'Csus2': { fingers: [-1, 3, 5, 5, 3, 3], barres: [{ fromString: 5, toString: 1, fret: 3 }], position: 3 },
  'Csus4': { fingers: [-1, 3, 3, 0, 1, 1] },

  // ── Diminished ──
  'Bdim':  { fingers: [-1, 2, 3, 4, 3, -1] },
  'Cdim':  { fingers: [-1, 3, 4, 5, 4, -1], position: 3 },
  'Ddim':  { fingers: [-1, -1, 0, 1, 3, 1] },
  'Edim':  { fingers: [0, 1, 2, 0, -1, -1] },
  'Fdim':  { fingers: [-1, -1, 3, 1, 0, 1] },
  'Gdim':  { fingers: [3, 4, 5, 3, -1, -1], position: 3 },
  'Adim':  { fingers: [-1, 0, 1, 2, 1, -1] },

  // ── Augmented ──
  'Caug':  { fingers: [-1, 3, 2, 1, 1, 0] },
  'Daug':  { fingers: [-1, -1, 0, 3, 3, 2] },
  'Eaug':  { fingers: [0, 3, 2, 1, 1, 0] },
  'Faug':  { fingers: [-1, -1, 3, 2, 2, 1] },
  'Gaug':  { fingers: [3, 2, 1, 0, 0, 3] },
  'Aaug':  { fingers: [-1, 0, 3, 2, 2, 1] },
};

export function getChordSettings(chordName: string) {
  const def = chordDefinitions[chordName];
  if (!def) return null;

  const position = def.position ?? 1;

  return {
    fingers: def.fingers
      .map((fret, i) => [6 - i, fret > 0 ? fret - position + 1 : fret] as [number, number])
      .filter(([, f]) => f > 0),
    barres: (def.barres ?? []).map(b => ({ ...b, fret: b.fret - position + 1 })),
    position,
    strings: 6,
    frets: 5,
  };
}

export function hasChordDiagram(chordName: string): boolean {
  return chordName in chordDefinitions;
}
