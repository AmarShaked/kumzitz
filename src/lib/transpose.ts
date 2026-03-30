import type { ChordSegment } from '../types/song';

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP: Record<string, string> = {
  Db: 'C#', Eb: 'D#', Fb: 'E', Gb: 'F#', Ab: 'G#', Bb: 'A#', Cb: 'B',
};

const CHORD_PARTS_REGEX = /^([A-G][b#]?)(.*)/;

function normalizeRoot(root: string): string {
  return FLAT_TO_SHARP[root] ?? root;
}

export function transposeChord(chord: string, semitones: number): string {
  const match = chord.match(CHORD_PARTS_REGEX);
  if (!match) return chord;
  const [, rawRoot, suffix] = match;
  const root = normalizeRoot(rawRoot);
  const index = CHROMATIC_SCALE.indexOf(root);
  if (index === -1) return chord;
  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return CHROMATIC_SCALE[newIndex] + suffix;
}

export function transposeSegments(segments: ChordSegment[], semitones: number): ChordSegment[] {
  return segments.map((seg) => ({
    chord: seg.chord ? transposeChord(seg.chord, semitones) : null,
    text: seg.text,
  }));
}

/**
 * Strip a chord down to its basic major or minor form.
 * Cm7 → Cm, C7 → C, Csus4 → C, Cdim → Cm, Caug → C, C6 → C, etc.
 */
export function simplifyChord(chord: string): string {
  const match = chord.match(CHORD_PARTS_REGEX);
  if (!match) return chord;
  const [, root, suffix] = match;
  // Keep minor, treat dim as minor, strip everything else
  const isMinor = /^m($|[^a])/.test(suffix) || suffix.startsWith('dim');
  return root + (isMinor ? 'm' : '');
}

const EASY_CHORDS = new Set(['C', 'D', 'E', 'G', 'A', 'Am', 'Dm', 'Em']);

/**
 * Find the transposition (0–11) that maximizes the number of "easy" open chords
 * after simplification.
 */
export function findEasiestTranspose(chords: string[]): number {
  const simplified = chords.map(simplifyChord);
  let bestTranspose = 0;
  let bestScore = -1;

  for (let t = 0; t < 12; t++) {
    let score = 0;
    for (const chord of simplified) {
      if (EASY_CHORDS.has(transposeChord(chord, t))) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestTranspose = t;
    }
  }

  return bestTranspose;
}
