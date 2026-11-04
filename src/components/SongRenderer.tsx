import { parseChordPro } from '../lib/chordpro';
import { transposeSegments, simplifyChord } from '../lib/transpose';
import type { ChordSegment } from '../types/song';

type SongRendererProps = {
  content: string;
  transpose?: number;
  simplify?: boolean;
  /** Final say on how each chord is shown (4-chords / easy shapes). */
  mapChord?: (chord: string) => string;
  fontSize?: number;
  onChordHover?: (chord: string, rect: DOMRect) => void;
  onChordLeave?: () => void;
};

function ChordSegmentSpan({
  segment,
  onChordHover,
  onChordLeave,
}: {
  segment: ChordSegment;
  onChordHover?: (chord: string, rect: DOMRect) => void;
  onChordLeave?: () => void;
}) {
  const handleMouseEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (segment.chord && onChordHover) {
      onChordHover(segment.chord, e.currentTarget.getBoundingClientRect());
    }
  };

  const chordOnly = segment.chord && !segment.text.trim();

  return (
    <span className={`inline-flex flex-col items-start${chordOnly ? ' mx-1' : ''}`}>
      <span
        className={`text-chord font-bold p-0.5 leading-none select-none ${segment.chord ? ' bg-chord/20 rounded ' : ''}`}
        style={{ direction: 'ltr', unicodeBidi: 'embed', fontSize: '0.825em' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onChordLeave}
      >
        {segment.chord ?? '\u00A0'}
      </span>
      <span className="whitespace-pre-wrap">{segment.text || '\u00A0'}</span>
    </span>
  );
}

function applySimplify(segments: ChordSegment[]): ChordSegment[] {
  return segments.map((seg) => ({
    chord: seg.chord ? simplifyChord(seg.chord) : null,
    text: seg.text,
  }));
}

/** Hebrew songs read right-to-left, English ones left-to-right (decided by the lyrics). */
export function songDirection(content: string, fallback: 'rtl' | 'ltr' = 'rtl'): 'rtl' | 'ltr' {
  const lyrics = content.replace(/\[[^\]]*\]/g, '');
  const hebrew = (lyrics.match(/[\u0590-\u05FF]/g) ?? []).length;
  const latin = (lyrics.match(/[A-Za-z]/g) ?? []).length;
  if (!hebrew && !latin) return fallback;
  return latin > hebrew ? 'ltr' : 'rtl';
}

export default function SongRenderer({
  content,
  transpose = 0,
  simplify = false,
  mapChord,
  fontSize = 18,
  onChordHover,
  onChordLeave,
}: SongRendererProps) {
  const lines = parseChordPro(content);
  const dir = songDirection(content);

  return (
    <div className="song-content" dir={dir} style={{ fontSize: `${fontSize}px` }}>
      {lines.map((line, lineIndex) => {
        let segments = line.segments;
        if (transpose !== 0) segments = transposeSegments(segments, transpose);
        if (simplify) segments = applySimplify(segments);
        if (mapChord) segments = segments.map((seg) => ({ ...seg, chord: seg.chord ? mapChord(seg.chord) : null }));
        return (
        <div key={lineIndex} dir={songDirection(segments.map((g) => g.text).join(''), dir)}
          className={segments.length === 0 ? 'h-6' : 'leading-loose'}>
          {segments.map((segment, segIndex) => (
            <ChordSegmentSpan
              key={segIndex}
              segment={segment}
              onChordHover={onChordHover}
              onChordLeave={onChordLeave}
            />
          ))}
        </div>
        );
      })}
    </div>
  );
}
