import { useState } from 'react';
import { useTuner, type TunerString } from './useTuner';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, ChevronRight } from 'lucide-react';

type Instrument = 'guitar' | 'ukulele' | 'ukulele-low-g';

const INSTRUMENT_CONFIGS: Record<Instrument, {
  label: string;
  tuningLabel: string;
  strings: TunerString[];
}> = {
  guitar: {
    label: 'גיטרה',
    tuningLabel: 'Standard',
    strings: [
      { note: 'E', octave: 2, freq: 82.41 },
      { note: 'A', octave: 2, freq: 110.0 },
      { note: 'D', octave: 3, freq: 146.83 },
      { note: 'G', octave: 3, freq: 196.0 },
      { note: 'B', octave: 3, freq: 246.94 },
      { note: 'E', octave: 4, freq: 329.63 },
    ],
  },
  ukulele: {
    label: 'אוקולילה',
    tuningLabel: 'Standard',
    strings: [
      { note: 'G', octave: 4, freq: 392.0 },
      { note: 'C', octave: 4, freq: 261.63 },
      { note: 'E', octave: 4, freq: 329.63 },
      { note: 'A', octave: 4, freq: 440.0 },
    ],
  },
  'ukulele-low-g': {
    label: 'אוקולילה',
    tuningLabel: 'Low-G',
    strings: [
      { note: 'G', octave: 3, freq: 196.0 },
      { note: 'C', octave: 4, freq: 261.63 },
      { note: 'E', octave: 4, freq: 329.63 },
      { note: 'A', octave: 4, freq: 440.0 },
    ],
  },
};

const INSTRUMENT_ORDER: Instrument[] = ['guitar', 'ukulele', 'ukulele-low-g'];

function HeadstockSVG({ pegPairs }: { pegPairs: 2 | 3 }) {
  const bodyHeight = pegPairs * 22 + 16;
  const nutY = bodyHeight;
  const neckY = bodyHeight + 5;
  const totalHeight = neckY + 44;
  return (
    <svg
      width="56"
      height={totalHeight}
      viewBox={`0 0 56 ${totalHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Headstock body at top */}
      <rect x="7" y="0" width="42" height={bodyHeight} rx="9" fill="#7c4f2a" />
      {/* Nut */}
      <rect x="17" y={nutY} width="22" height="5" rx="1" fill="#c8b89a" />
      {/* Neck going down */}
      <rect x="20" y={neckY} width="16" height="44" rx="4" fill="#5c3a1e" />
      {/* Tuning pegs + strings */}
      {Array.from({ length: pegPairs }, (_, i) => {
        const pegY = 14 + i * 22;
        return (
          <g key={i}>
            <circle cx="8" cy={pegY} r="5" fill="#777" />
            <circle cx="8" cy={pegY} r="3" fill="#aaa" />
            <circle cx="48" cy={pegY} r="5" fill="#777" />
            <circle cx="48" cy={pegY} r="3" fill="#aaa" />
            <line x1="28" y1={nutY} x2="28" y2={totalHeight} stroke="#c8b89a" strokeWidth="0.8" opacity="0.5" />
          </g>
        );
      })}
    </svg>
  );
}

function TuningGraph({
  cents,
  note,
  octave,
  inTune,
}: {
  cents: number;
  note: string | null;
  octave: number | null;
  inTune: boolean;
}) {
  const hasNote = !!note;
  const clamped = Math.max(-50, Math.min(50, cents));
  const bubbleOffset = (clamped / 50) * 45;

  const dirLabel = !hasNote
    ? null
    : inTune
    ? 'מכוון! ✓'
    : cents < 0
    ? 'כוון למעלה'
    : 'כוון למטה';

  const labelOnRight = cents < 0;

  return (
    <div
      className="relative h-28 rounded-xl overflow-hidden"
      style={{
        background: `
          repeating-linear-gradient(0deg, transparent, transparent 17px, rgba(255,255,255,0.03) 17px, rgba(255,255,255,0.03) 18px),
          repeating-linear-gradient(90deg, transparent, transparent 17px, rgba(255,255,255,0.03) 17px, rgba(255,255,255,0.03) 18px)
        `,
        backgroundColor: 'hsl(var(--muted) / 0.2)',
      }}
    >
      {/* Center target line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-destructive/60" />

      {hasNote && (
        <>
          {/* Cents bubble */}
          <div
            className={`
              absolute top-4 w-10 h-10 rounded-full
              flex items-center justify-center
              text-xs font-bold text-white
              transition-[left] duration-100 ease-out
              ${inTune ? 'bg-success' : 'bg-destructive'}
            `}
            style={{ left: `calc(50% + ${bubbleOffset}% - 20px)` }}
          >
            {inTune ? '✓' : clamped > 0 ? `+${clamped}` : clamped}
          </div>

          {/* Direction label */}
          {dirLabel && (
            <div
              className="absolute top-6 text-xs font-medium px-2 py-0.5 rounded-full text-white whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(0,0,0,0.45)',
                ...(labelOnRight
                  ? { left: 'calc(50% + 28px)' }
                  : { right: 'calc(50% + 28px)' }),
              }}
            >
              {dirLabel}
            </div>
          )}

          {/* Note + octave pill */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-4 py-0.5 text-sm font-bold text-white"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            dir="ltr"
          >
            {note}
            <sup className="text-[10px] ml-0.5">{octave}</sup>
          </div>
        </>
      )}

      {!hasNote && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 text-sm">
          נגן מיתר
        </div>
      )}
    </div>
  );
}

function StringCircle({
  string,
  isActive,
  isSelected,
  onClick,
}: {
  string: TunerString;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-11 h-11 rounded-full flex items-center justify-center
        text-sm font-bold transition-all duration-300
        ${isSelected
          ? 'bg-primary text-primary-foreground scale-110 shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background'
          : isActive
          ? 'bg-primary/60 text-primary-foreground scale-105'
          : 'bg-secondary text-secondary-foreground'
        }
      `}
    >
      <div className="flex flex-col items-center leading-none">
        <span>{string.note}</span>
        <span className="text-[9px] opacity-60">{string.octave}</span>
      </div>
    </button>
  );
}

export default function TunerPage() {
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const [selectedString, setSelectedString] = useState<TunerString | null>(null);
  const config = INSTRUMENT_CONFIGS[instrument];
  const tuner = useTuner(config.strings);

  const half = Math.ceil(config.strings.length / 2);
  const leftStrings = config.strings.slice(0, half);
  const rightStrings = config.strings.slice(half);
  const pegPairs = config.strings.length === 4 ? 2 : 3;

  // In manual mode, compute cents relative to the selected string's target freq
  const displayCents = selectedString && tuner.frequency
    ? Math.max(-50, Math.min(50, Math.round(1200 * Math.log2(tuner.frequency / selectedString.freq))))
    : tuner.cents;
  const displayNote = selectedString ? selectedString.note : tuner.note;
  const displayOctave = selectedString ? selectedString.octave : tuner.octave;
  const displayInTune = selectedString && tuner.frequency
    ? Math.abs(displayCents) <= 5
    : tuner.inTune;

  function handleStringClick(s: TunerString) {
    setSelectedString((prev) =>
      prev?.note === s.note && prev?.octave === s.octave ? null : s
    );
  }

  function handleInstrumentCycle() {
    const next =
      INSTRUMENT_ORDER[(INSTRUMENT_ORDER.indexOf(instrument) + 1) % INSTRUMENT_ORDER.length];
    if (tuner.isListening) tuner.stop();
    setSelectedString(null);
    setInstrument(next);
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-6 space-y-5">
      {/* Top bar */}
      <button
        onClick={handleInstrumentCycle}
        className="flex flex-col items-start group"
        aria-label="החלף כלי נגינה"
      >
        <span className="flex items-center gap-0.5 text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {config.label}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="text-xs text-muted-foreground">{config.tuningLabel}</span>
      </button>

      {/* Tuning graph */}
      <TuningGraph
        cents={displayCents}
        note={displayNote}
        octave={displayOctave}
        inTune={displayInTune}
      />

      {/* Instrument area */}
      <div className="flex items-start justify-between px-2" dir="ltr" style={{ minHeight: '144px' }}>
        <div className="flex flex-col gap-3">
          {leftStrings.map((s) => (
            <StringCircle
              key={`${s.note}${s.octave}`}
              string={s}
              isActive={!selectedString && tuner.note === s.note && tuner.octave === s.octave}
              isSelected={selectedString?.note === s.note && selectedString?.octave === s.octave}
              onClick={() => handleStringClick(s)}
            />
          ))}
        </div>

        <HeadstockSVG pegPairs={pegPairs} />

        <div className="flex flex-col gap-3">
          {rightStrings.map((s) => (
            <StringCircle
              key={`${s.note}${s.octave}`}
              string={s}
              isActive={!selectedString && tuner.note === s.note && tuner.octave === s.octave}
              isSelected={selectedString?.note === s.note && selectedString?.octave === s.octave}
              onClick={() => handleStringClick(s)}
            />
          ))}
        </div>
      </div>

      {/* Mode hint */}
      <p className="text-center text-xs text-muted-foreground">
        {selectedString
          ? `מיתר נבחר: ${selectedString.note}${selectedString.octave} — לחץ שוב לביטול`
          : 'לחץ על מיתר לכיוון ידני'}
      </p>

      {/* Start/Stop button */}
      <div className="flex justify-center">
        {tuner.isListening ? (
          <Button size="lg" variant="destructive" onClick={tuner.stop} className="gap-2">
            <MicOff className="h-5 w-5" />
            עצור
          </Button>
        ) : (
          <Button size="lg" onClick={tuner.start} className="gap-2">
            <Mic className="h-5 w-5" />
            התחל כיוון
          </Button>
        )}
      </div>
    </div>
  );
}
