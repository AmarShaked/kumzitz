type UkeDef = {
  fingers: [number, number, number, number];
  barres?: { fromString: number; toString: number; fret: number }[];
  position?: number;
};

const ukuleleDefinitions: Record<string, UkeDef> = {
  // ── Major ──
  'C':    { fingers: [0, 0, 0, 3] },
  'C#':   { fingers: [1, 1, 1, 4], barres: [{ fromString: 4, toString: 1, fret: 1 }] },
  'Db':   { fingers: [1, 1, 1, 4], barres: [{ fromString: 4, toString: 1, fret: 1 }] },
  'D':    { fingers: [2, 2, 2, 0] },
  'D#':   { fingers: [0, 3, 3, 1] },
  'Eb':   { fingers: [0, 3, 3, 1] },
  'E':    { fingers: [1, 4, 0, 2] },
  'F':    { fingers: [2, 0, 1, 0] },
  'F#':   { fingers: [3, 1, 2, 1], barres: [{ fromString: 4, toString: 1, fret: 1 }] },
  'Gb':   { fingers: [3, 1, 2, 1], barres: [{ fromString: 4, toString: 1, fret: 1 }] },
  'G':    { fingers: [0, 2, 3, 2] },
  'G#':   { fingers: [5, 3, 4, 3], barres: [{ fromString: 4, toString: 1, fret: 3 }], position: 3 },
  'Ab':   { fingers: [5, 3, 4, 3], barres: [{ fromString: 4, toString: 1, fret: 3 }], position: 3 },
  'A':    { fingers: [2, 1, 0, 0] },
  'A#':   { fingers: [3, 2, 1, 1], barres: [{ fromString: 2, toString: 1, fret: 1 }] },
  'Bb':   { fingers: [3, 2, 1, 1], barres: [{ fromString: 2, toString: 1, fret: 1 }] },
  'B':    { fingers: [4, 3, 2, 2], barres: [{ fromString: 2, toString: 1, fret: 2 }], position: 2 },

  // ── Minor ──
  'Am':   { fingers: [2, 0, 0, 0] },
  'A#m':  { fingers: [3, 1, 1, 1], barres: [{ fromString: 3, toString: 1, fret: 1 }] },
  'Bbm':  { fingers: [3, 1, 1, 1], barres: [{ fromString: 3, toString: 1, fret: 1 }] },
  'Bm':   { fingers: [4, 2, 2, 2], barres: [{ fromString: 3, toString: 1, fret: 2 }], position: 2 },
  'Cm':   { fingers: [0, 3, 3, 3], barres: [{ fromString: 3, toString: 1, fret: 3 }] },
  'C#m':  { fingers: [1, 4, 4, 4], barres: [{ fromString: 3, toString: 1, fret: 4 }], position: 4 },
  'Dm':   { fingers: [2, 2, 1, 0] },
  'D#m':  { fingers: [3, 3, 2, 1] },
  'Ebm':  { fingers: [3, 3, 2, 1] },
  'Em':   { fingers: [0, 4, 3, 2] },
  'Fm':   { fingers: [1, 0, 1, 3] },
  'F#m':  { fingers: [2, 1, 2, 0] },
  'Gbm':  { fingers: [2, 1, 2, 0] },
  'Gm':   { fingers: [0, 2, 3, 1] },
  'G#m':  { fingers: [1, 3, 4, 2] },
  'Abm':  { fingers: [1, 3, 4, 2] },

  // ── 7th ──
  'A7':   { fingers: [0, 1, 0, 0] },
  'B7':   { fingers: [2, 3, 2, 2], barres: [{ fromString: 4, toString: 1, fret: 2 }], position: 2 },
  'Bb7':  { fingers: [1, 2, 1, 1], barres: [{ fromString: 4, toString: 1, fret: 1 }] },
  'C7':   { fingers: [0, 0, 0, 1] },
  'D7':   { fingers: [2, 2, 2, 3] },
  'E7':   { fingers: [1, 2, 0, 2] },
  'F7':   { fingers: [2, 3, 1, 3] },
  'G7':   { fingers: [0, 2, 1, 2] },

  // ── Minor 7th ──
  'Am7':  { fingers: [0, 0, 0, 0] },
  'Bm7':  { fingers: [2, 2, 2, 2], barres: [{ fromString: 4, toString: 1, fret: 2 }], position: 2 },
  'Cm7':  { fingers: [3, 3, 3, 3], barres: [{ fromString: 4, toString: 1, fret: 3 }], position: 3 },
  'Dm7':  { fingers: [2, 2, 1, 3] },
  'Em7':  { fingers: [0, 2, 0, 2] },
  'Fm7':  { fingers: [1, 3, 1, 3] },
  'Gm7':  { fingers: [0, 2, 1, 1] },
};

export function getUkuleleChordSettings(chordName: string) {
  const def = ukuleleDefinitions[chordName];
  if (!def) return null;

  const position = def.position ?? 1;

  return {
    fingers: def.fingers
      .map((fret, i) => [4 - i, fret > 0 ? fret - position + 1 : fret] as [number, number])
      .filter(([, f]) => f > 0),
    barres: (def.barres ?? []).map(b => ({ ...b, fret: b.fret - position + 1 })),
    position,
    strings: 4,
    frets: 5,
  };
}

export function hasUkuleleChord(chordName: string): boolean {
  return chordName in ukuleleDefinitions;
}
