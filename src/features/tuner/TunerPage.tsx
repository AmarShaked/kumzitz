import { useTuner } from './useTuner';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

const GUITAR_STRINGS = [
  { label: 'E2', note: 'E', octave: 2 },
  { label: 'A2', note: 'A', octave: 2 },
  { label: 'D3', note: 'D', octave: 3 },
  { label: 'G3', note: 'G', octave: 3 },
  { label: 'B3', note: 'B', octave: 3 },
  { label: 'E4', note: 'E', octave: 4 },
];

function NeedleGauge({ cents, active }: { cents: number; active: boolean }) {
  const rotation = active ? (cents / 50) * 45 : 0;
  const inTune = active && Math.abs(cents) <= 5;

  return (
    <div className="relative w-64 h-32 mx-auto">
      {/* Arc background */}
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Tick marks */}
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

        {/* Center zone highlight */}
        <path
          d={`M ${100 + 82 * Math.cos((-99 * Math.PI) / 180)} ${100 + 82 * Math.sin((-99 * Math.PI) / 180)}
              A 82 82 0 0 1 ${100 + 82 * Math.cos((-81 * Math.PI) / 180)} ${100 + 82 * Math.sin((-81 * Math.PI) / 180)}`}
          fill="none"
          className="stroke-success/30"
          strokeWidth={6}
          strokeLinecap="round"
        />

        {/* Needle */}
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

        {/* Center dot */}
        <circle cx={100} cy={100} r={4} className={inTune ? 'fill-success' : 'fill-muted-foreground/50'} />

        {/* Labels */}
        <text x={18} y={98} className="fill-muted-foreground text-[8px]" textAnchor="middle">-50</text>
        <text x={100} y={18} className="fill-success text-[8px]" textAnchor="middle">0</text>
        <text x={182} y={98} className="fill-muted-foreground text-[8px]" textAnchor="middle">+50</text>
      </svg>
    </div>
  );
}

function StringIndicator({ strings, activeNote, activeOctave }: {
  strings: typeof GUITAR_STRINGS;
  activeNote: string | null;
  activeOctave: number | null;
}) {
  return (
    <div className="flex justify-center gap-3">
      {strings.map((s) => {
        const isActive = activeNote === s.note && activeOctave === s.octave;
        return (
          <div
            key={s.label}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
              transition-all duration-300
              ${isActive
                ? 'bg-primary text-primary-foreground scale-110 shadow-lg'
                : 'bg-secondary text-secondary-foreground'}
            `}
          >
            {s.label}
          </div>
        );
      })}
    </div>
  );
}

export default function TunerPage() {
  const tuner = useTuner();

  return (
    <div className="mx-auto max-w-lg p-6 space-y-8">
      <h1 className="text-2xl font-bold text-center">כיוון גיטרה</h1>

      {/* Note display */}
      <div className="text-center space-y-2">
        <div
          className={`
            text-8xl font-bold tracking-tight transition-all duration-300
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
        strings={GUITAR_STRINGS}
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
