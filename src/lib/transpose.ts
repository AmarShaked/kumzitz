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
