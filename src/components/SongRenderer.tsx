import { parseChordPro } from '../lib/chordpro';
import { transposeSegments, simplifyChord } from '../lib/transpose';
import type { ChordSegment } from '../types/song';

type SongRendererProps = {
  content: string;
  transpose?: number;
  simplify?: boolean;
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
        className="text-chord font-bold select-none h-6"
        style={{ direction: 'ltr', unicodeBidi: 'embed' }}
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

export default function SongRenderer({
  content,
  transpose = 0,
  simplify = false,
  fontSize = 18,
  onChordHover,
  onChordLeave,
}: SongRendererProps) {
  const lines = parseChordPro(content);

  return (
    <div className="song-content" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
      {lines.map((line, lineIndex) => {
        let segments = line.segments;
        if (transpose !== 0) segments = transposeSegments(segments, transpose);
        if (simplify) segments = applySimplify(segments);
        return (
        <div key={lineIndex} className={segments.length === 0 ? 'h-6' : 'leading-loose'}>
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
