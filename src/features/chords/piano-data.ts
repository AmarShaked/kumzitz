/**
 * Piano chord data: maps chord names to arrays of MIDI note numbers
 * (relative to C3 = 48). Each array contains the notes to highlight.
 */

const NOTE_MAP: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

// Intervals from root for each quality
const QUALITY_INTERVALS: Record<string, number[]> = {
  '':      [0, 4, 7],       // major
  'm':     [0, 3, 7],       // minor
  '7':     [0, 4, 7, 10],   // dominant 7
  'm7':    [0, 3, 7, 10],   // minor 7
  'maj7':  [0, 4, 7, 11],   // major 7
  'dim':   [0, 3, 6],       // diminished
  'aug':   [0, 4, 8],       // augmented
  'sus2':  [0, 2, 7],       // sus2
  'sus4':  [0, 5, 7],       // sus4
  '6':     [0, 4, 7, 9],    // 6th
  'm6':    [0, 3, 7, 9],    // minor 6th
  '9':     [0, 4, 7, 10, 14], // 9th
  'add9':  [0, 4, 7, 14],   // add9
  '5':     [0, 7],          // power chord
  'dim7':  [0, 3, 6, 9],    // diminished 7
};

const CHORD_REGEX = /^([A-G][b#]?)(.*)/;

export function getPianoNotes(chordName: string): number[] | null {
  const match = chordName.match(CHORD_REGEX);
  if (!match) return null;

  const [, root, suffix] = match;
  const rootNote = NOTE_MAP[root];
  if (rootNote === undefined) return null;

  // Handle slash chords — just use the part before /
  const quality = suffix.split('/')[0];
  const intervals = QUALITY_INTERVALS[quality];
  if (!intervals) return null;

  return intervals.map((i) => rootNote + i);
}

export function hasPianoChord(chordName: string): boolean {
  return getPianoNotes(chordName) !== null;
}
