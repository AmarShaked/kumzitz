import type { ChordSegment, SongLine, ChordProDirectives } from '../types/song';

const CHORD_REGEX = /\[([^\]]+)\]/g;

export function parseLine(line: string): ChordSegment[] {
  if (line === '') return [];

  const segments: ChordSegment[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(CHORD_REGEX)) {
    const index = match.index!;
    if (index > lastIndex) {
      segments.push({ chord: null, text: line.slice(lastIndex, index) });
    }
    const chord = match[1];
    const afterChord = match.index! + match[0].length;
    const nextMatch = line.indexOf('[', afterChord);
    const textEnd = nextMatch === -1 ? line.length : nextMatch;
    const text = line.slice(afterChord, textEnd);
    segments.push({ chord, text });
    lastIndex = textEnd;
  }

  if (lastIndex === 0 && line.length > 0) {
    segments.push({ chord: null, text: line });
  }

  return segments;
}

export function parseChordPro(content: string): SongLine[] {
  return content.split('\n').map((line) => ({
    segments: parseLine(line),
  }));
}

export function serializeLine(segments: ChordSegment[]): string {
  return segments
    .map((seg) => (seg.chord ? `[${seg.chord}]${seg.text}` : seg.text))
    .join('');
}

export function serializeChordPro(lines: SongLine[]): string {
  return lines.map((line) => serializeLine(line.segments)).join('\n');
}

const DIRECTIVE_REGEX = /^\{(\w+):\s*(.+)\}$/;

export function parseDirectives(content: string): {
  directives: ChordProDirectives;
  content: string;
} {
  const directives: ChordProDirectives = {};
  const contentLines: string[] = [];

  for (const line of content.split('\n')) {
    const match = line.match(DIRECTIVE_REGEX);
    if (match) {
      const [, key, value] = match;
      if (key === 'title' || key === 'artist' || key === 'key') {
        directives[key] = value.trim();
      }
    } else {
      contentLines.push(line);
    }
  }

  return { directives, content: contentLines.join('\n') };
}
