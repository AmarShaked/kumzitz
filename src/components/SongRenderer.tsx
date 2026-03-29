import { parseChordPro } from '../lib/chordpro';
import { transposeSegments } from '../lib/transpose';
import type { ChordSegment } from '../types/song';

type SongRendererProps = {
  content: string;
  transpose?: number;
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

  return (
    <span className="inline-flex flex-col items-start">
      <span
        className="text-blue-400 font-bold select-none h-6"
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

export default function SongRenderer({
  content,
  transpose = 0,
  fontSize = 18,
  onChordHover,
  onChordLeave,
}: SongRendererProps) {
  const lines = parseChordPro(content);

  return (
    <div className="song-content" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className={line.segments.length === 0 ? 'h-6' : 'leading-loose'}>
          {(transpose !== 0
            ? transposeSegments(line.segments, transpose)
            : line.segments
          ).map((segment, segIndex) => (
            <ChordSegmentSpan
              key={segIndex}
              segment={segment}
              onChordHover={onChordHover}
              onChordLeave={onChordLeave}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
