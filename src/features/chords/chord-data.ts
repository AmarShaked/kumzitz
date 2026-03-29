type ChordDef = {
  fingers: [number, number, number, number, number, number];
  barres?: { fromString: number; toString: number; fret: number }[];
  position?: number;
};

const chordDefinitions: Record<string, ChordDef> = {
  'C':    { fingers: [-1, 3, 2, 0, 1, 0] },
  'D':    { fingers: [-1, -1, 0, 2, 3, 2] },
  'E':    { fingers: [0, 2, 2, 1, 0, 0] },
  'F':    { fingers: [-1, -1, 3, 2, 1, 1], barres: [{ fromString: 4, toString: 1, fret: 1 }] },
  'G':    { fingers: [3, 2, 0, 0, 0, 3] },
  'A':    { fingers: [-1, 0, 2, 2, 2, 0] },
  'B':    { fingers: [-1, 2, 4, 4, 4, 2], barres: [{ fromString: 5, toString: 1, fret: 2 }] },
  'Am':   { fingers: [-1, 0, 2, 2, 1, 0] },
  'Bm':   { fingers: [-1, 2, 4, 4, 3, 2], barres: [{ fromString: 5, toString: 1, fret: 2 }] },
  'Cm':   { fingers: [-1, 3, 5, 5, 4, 3], barres: [{ fromString: 5, toString: 1, fret: 3 }], position: 3 },
  'Dm':   { fingers: [-1, -1, 0, 2, 3, 1] },
  'Em':   { fingers: [0, 2, 2, 0, 0, 0] },
  'Fm':   { fingers: [1, 3, 3, 1, 1, 1], barres: [{ fromString: 6, toString: 1, fret: 1 }] },
  'Gm':   { fingers: [3, 5, 5, 3, 3, 3], barres: [{ fromString: 6, toString: 1, fret: 3 }], position: 3 },
  'A7':   { fingers: [-1, 0, 2, 0, 2, 0] },
  'B7':   { fingers: [-1, 2, 1, 2, 0, 2] },
  'C7':   { fingers: [-1, 3, 2, 3, 1, 0] },
  'D7':   { fingers: [-1, -1, 0, 2, 1, 2] },
  'E7':   { fingers: [0, 2, 0, 1, 0, 0] },
  'G7':   { fingers: [3, 2, 0, 0, 0, 1] },
};

export function getChordSettings(chordName: string) {
  const def = chordDefinitions[chordName];
  if (!def) return null;

  return {
    fingers: def.fingers.map((fret, i) => [6 - i, fret]).filter(([, f]) => (f as number) > 0) as [number, number][],
    barres: def.barres ?? [],
    position: def.position ?? 1,
    strings: 6,
    frets: 5,
  };
}

export function hasChordDiagram(chordName: string): boolean {
  return chordName in chordDefinitions;
}
