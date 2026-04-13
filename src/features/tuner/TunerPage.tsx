import { useState } from 'react';
import { useTuner, type TunerString } from './useTuner';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

type Instrument = 'guitar' | 'ukulele' | 'ukulele-low-g';

const INSTRUMENT_CONFIGS: Record<Instrument, { label: string; title: string; strings: TunerString[] }> = {
  guitar: {
    label: 'גיטרה',
    title: 'כיוון גיטרה',
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
    title: 'כיוון אוקולילה',
    strings: [
      { note: 'G', octave: 4, freq: 392.0 },
      { note: 'C', octave: 4, freq: 261.63 },
      { note: 'E', octave: 4, freq: 329.63 },
      { note: 'A', octave: 4, freq: 440.0 },
    ],
  },
  'ukulele-low-g': {
    label: 'אוקולילה Low-G',
    title: 'כיוון אוקולילה (Low-G)',
    strings: [
      { note: 'G', octave: 3, freq: 196.0 },
      { note: 'C', octave: 4, freq: 261.63 },
      { note: 'E', octave: 4, freq: 329.63 },
      { note: 'A', octave: 4, freq: 440.0 },
    ],
  },
};

function NeedleGauge({ cents, active }: { cents: number; active: boolean }) {
  const rotation = active ? (cents / 50) * 45 : 0;
  const inTune = active && Math.abs(cents) <= 5;

  return (
    <div className="relative w-full max-w-64 h-auto mx-auto aspect-[2/1]">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {Array.from({ length: 21 }, (_, i) => {
          const angle = -90 + (i / 20) * 180;
          const rad = (angle * Math.PI) / 180;
          const isMajor = i % 5 === 0;
          const r1 = isMajor ? 72 : 76;
          const r2 = 82;
          return (
            <line
              key={i}
              x1={100 + r1 * Math.cos(rad)}
              y1={100 + r1 * Math.sin(rad)}
              x2={100 + r2 * Math.cos(rad)}
              y2={100 + r2 * Math.sin(rad)}
              className={i === 10 ? 'stroke-success' : 'stroke-muted-foreground/40'}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}

        <path
          d={`M ${100 + 82 * Math.cos((-99 * Math.PI) / 180)} ${100 + 82 * Math.sin((-99 * Math.PI) / 180)}
              A 82 82 0 0 1 ${100 + 82 * Math.cos((-81 * Math.PI) / 180)} ${100 + 82 * Math.sin((-81 * Math.PI) / 180)}`}
          fill="none"
          className="stroke-success/30"
          strokeWidth={6}
          strokeLinecap="round"
        />

        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: '100px 100px',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <line
            x1={100}
            y1={100}
            x2={100}
            y2={20}
            className={inTune ? 'stroke-success' : active ? 'stroke-primary' : 'stroke-muted-foreground/30'}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </g>

        <circle cx={100} cy={100} r={4} className={inTune ? 'fill-success' : 'fill-muted-foreground/50'} />

        <text x={18} y={98} className="fill-muted-foreground text-[8px]" textAnchor="middle">-50</text>
        <text x={100} y={18} className="fill-success text-[8px]" textAnchor="middle">0</text>
        <text x={182} y={98} className="fill-muted-foreground text-[8px]" textAnchor="middle">+50</text>
      </svg>
    </div>
  );
}

function StringIndicator({ strings, activeNote, activeOctave }: {
  strings: TunerString[];
  activeNote: string | null;
  activeOctave: number | null;
}) {
  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {strings.map((s) => {
        const isActive = activeNote === s.note && activeOctave === s.octave;
        const label = `${s.note}${s.octave}`;
        return (
          <div
            key={label}
            className={`
              w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold
              transition-all duration-300
              ${isActive
                ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                : 'bg-secondary text-secondary-foreground'}
            `}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

export default function TunerPage() {
  const [instrument, setInstrument] = useState<Instrument>('guitar');
  const config = INSTRUMENT_CONFIGS[instrument];
  const tuner = useTuner(config.strings);

  function handleInstrumentChange(next: Instrument) {
    if (next === instrument) return;
    if (tuner.isListening) tuner.stop();
    setInstrument(next);
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold text-center">{config.title}</h1>

      {/* Instrument selector */}
      <div className="flex justify-center gap-2" dir="rtl">
        {(Object.keys(INSTRUMENT_CONFIGS) as Instrument[]).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={instrument === key ? 'default' : 'outline'}
            onClick={() => handleInstrumentChange(key)}
          >
            {INSTRUMENT_CONFIGS[key].label}
          </Button>
        ))}
      </div>

      {/* Note display */}
      <div className="text-center space-y-2">
        <div
          className={`
            text-6xl sm:text-8xl font-bold tracking-tight transition-all duration-300
            ${tuner.inTune ? 'text-success scale-110' : tuner.note ? 'text-foreground' : 'text-muted-foreground/30'}
          `}
          style={{ direction: 'ltr' }}
        >
          {tuner.note ?? '—'}
        </div>
        {tuner.frequency && (
          <p className="text-sm text-muted-foreground" dir="ltr">
            {tuner.frequency} Hz
          </p>
        )}
      </div>

      {/* Gauge */}
      <NeedleGauge cents={tuner.cents} active={!!tuner.note} />

      {/* Cents indicator */}
      <div className="text-center">
        <span
          className={`
            inline-block px-4 py-1 rounded-full text-sm font-medium transition-all duration-300
            ${tuner.inTune
              ? 'bg-success/20 text-success'
              : tuner.note
                ? tuner.cents > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground'}
          `}
        >
          {tuner.inTune ? 'מכוון!' : tuner.note ? (tuner.cents > 0 ? `גבוה +${tuner.cents}` : `נמוך ${tuner.cents}`) : 'נגן מיתר'}
        </span>
      </div>

      {/* String indicators */}
      <StringIndicator
        strings={config.strings}
        activeNote={tuner.note}
        activeOctave={tuner.octave}
      />

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

      {/* In-tune pulse animation */}
      {tuner.inTune && (
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-success animate-ping absolute" />
            <div className="w-4 h-4 rounded-full bg-success" />
          </div>
        </div>
      )}
    </div>
  );
}
