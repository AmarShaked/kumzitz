import { getPianoNotes } from './piano-data';
import { useTheme } from '@/hooks/useTheme';

type PianoDiagramProps = { chord: string; width?: number };

// Semitone → is black key?
const IS_BLACK = [false, true, false, true, false, false, true, false, true, false, true, false];

// Allowed starting semitones (white keys that start a natural group): C=0, F=5
const ALLOWED_STARTS = [0, 5];

function pickStart(root: number): number {
  // Pick the allowed start that puts the root as far left as possible
  // i.e., the largest allowed start that is <= root
  let best = 0;
  for (const s of ALLOWED_STARTS) {
    if (s <= root) best = s;
  }
  return best;
}

type KeyInfo = { semitone: number; isBlack: boolean; whiteIndex: number };

function buildKeys(startSemitone: number, count: number): KeyInfo[] {
  const keys: KeyInfo[] = [];
  let whiteIdx = 0;
  for (let i = 0; i < count; i++) {
    const sem = (startSemitone + i) % 12;
    const black = IS_BLACK[sem];
    keys.push({ semitone: startSemitone + i, isBlack: black, whiteIndex: whiteIdx });
    if (!black) whiteIdx++;
  }
  return keys;
}

export default function PianoDiagram({ chord, width = 160 }: PianoDiagramProps) {
  const { theme } = useTheme();
  const notes = getPianoNotes(chord);
  if (!notes) return null;

  const isDark = theme === 'dark';
  const root = notes[0] % 12;
  const startSemitone = pickStart(root);

  // Figure out how many semitones we need to show all chord notes
  const maxNote = Math.max(...notes);
  const span = maxNote - notes[0] + 1;
  // We need from startSemitone to at least (root + span), plus a bit of padding
  const endSemitone = root + span + 2;
  const totalSemitones = Math.max(13, endSemitone - startSemitone + 1); // at least one octave

  const allKeys = buildKeys(startSemitone, totalSemitones);
  const whiteKeys = allKeys.filter((k) => !k.isBlack);
  const blackKeys = allKeys.filter((k) => k.isBlack);
  const numWhites = whiteKeys.length;

  const activeAbsolute = new Set(notes.map((n) => n % 12));

  const whiteW = width / numWhites;
  const height = width * 0.55;
  const blackW = whiteW * 0.6;
  const blackH = height * 0.6;

  const activeColor = isDark ? '#ceb89f' : '#9f8e7f';
  const whiteColor = isDark ? '#e8e2dc' : '#ffffff';
  const blackColor = isDark ? '#2a2420' : '#3d3530';
  const borderColor = isDark ? '#4d443d' : '#c4bab2';

  return (
    <svg width={width} viewBox={`0 0 ${width} ${height}`} className="block mx-auto">
      {/* Title */}
      <text
        x={width / 2} y={14}
        textAnchor="middle"
        className="text-[11px] font-bold"
        fill={isDark ? '#ceb89f' : '#9f8e7f'}
      >
        {chord}
      </text>

      {/* White keys */}
      {whiteKeys.map((key, i) => {
        const isActive = activeAbsolute.has(key.semitone % 12);
        return (
          <rect
            key={`w-${i}`}
            x={i * whiteW}
            y={20}
            width={whiteW - 1}
            height={height - 22}
            rx={2}
            fill={isActive ? activeColor : whiteColor}
            stroke={borderColor}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Black keys — position between the white keys they sit between */}
      {blackKeys.map((key) => {
        // Find the white key index just before this black key
        const prevWhite = whiteKeys.filter((w) => w.semitone < key.semitone).length;
        const xPos = prevWhite * whiteW - blackW / 2;
        const isActive = activeAbsolute.has(key.semitone % 12);
        return (
          <rect
            key={`b-${key.semitone}`}
            x={xPos}
            y={20}
            width={blackW}
            height={blackH}
            rx={2}
            fill={isActive ? activeColor : blackColor}
            stroke={borderColor}
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}
